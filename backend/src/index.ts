import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectDB from "./db";
import Url from "./models/Url";
import Click from "./models/Click";
import { UAParser } from "ua-parser-js";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/authRoutes";
import { protect, AuthRequest } from "./middleware/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const recordClick = async (req: Request, urlId: any) => {
  try {
    const userAgentStr = req.headers["user-agent"] || "";
    const parser = new UAParser(userAgentStr);
    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";
    const deviceType = parser.getDevice().type;
    const device =
      deviceType === "mobile" || deviceType === "tablet" ? "Mobile" : "Desktop";
    const ip = req.ip || req.socket?.remoteAddress || "Unknown";

    const click = new Click({
      urlId,
      ipAddress: ip,
      userAgent: userAgentStr,
      browser,
      os,
      device,
    });
    await click.save();
  } catch (err) {
    console.error("Error saving click:", err);
  }
};

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const optionalProtect = (
  req: AuthRequest,
  res: Response,
  next: express.NextFunction,
) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secret123",
      ) as any;
      req.user = { id: decoded.id };
    } catch (err) {}
  }
  next();
};

// Create a short URL
app.post(
  "/shorten",
  optionalProtect,
  async (req: AuthRequest, res: Response): Promise<any> => {
    const { originalUrl, startDate, expiresAt, password, customUrlCode, isQr } =
      req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "originalUrl is required" });
    }

    // Basic URL validation
    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    if (!urlRegex.test(originalUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    try {
      let finalCode = customUrlCode;

      if (customUrlCode) {
        // Check if custom code already exists
        const existing = await Url.findOne({
          urlCode: customUrlCode,
          isDeleted: false,
        });
        if (existing) {
          return res
            .status(400)
            .json({ error: "Custom link is already in use" });
        }
      } else {
        // Check if URL already exists with same password status
        const existingUrls = await Url.find({ originalUrl, isDeleted: false });

        for (const url of existingUrls) {
          if (password) {
            if (url.password) {
              const isMatch = await bcrypt.compare(password, url.password);
              if (isMatch) return res.json(url);
            }
          } else {
            if (!url.password) {
              return res.json(url);
            }
          }
        }

        // Create new URL code if no exact match is found
        finalCode = crypto.randomBytes(4).toString("hex");
      }

      const shortUrl = `${process.env.BASE_URL}/${finalCode}`;

      let hashedPassword;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }

      const newUrl = new Url({
        originalUrl,
        shortUrl,
        urlCode: finalCode,
        startDate: startDate ? new Date(startDate) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        password: hashedPassword,
        userId: req.user?.id,
        isQr: !!isQr,
        isCustom: !!customUrlCode,
      });

      await newUrl.save();
      return res.status(201).json(newUrl);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  },
);

// Redirect to original URL
app.get("/:code", async (req: Request, res: Response): Promise<any> => {
  try {
    const { code } = req.params;
    const url = await Url.findOne({ urlCode: code, isDeleted: false });

    if (url) {
      if (url.startDate && url.startDate > new Date()) {
        return res.status(403).json({ error: "URL is not active yet" });
      }
      if (url.expiresAt && url.expiresAt < new Date()) {
        return res.status(410).json({ error: "URL has expired" });
      }
      if (url.password) {
        return res.redirect(`http://localhost:5173/?unlock=${code}`);
      }

      await recordClick(req, url._id);
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json({ error: "URL not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// Verify Password
app.post(
  "/verify-password",
  async (req: Request, res: Response): Promise<any> => {
    const { code, password } = req.body;
    if (!code || !password)
      return res.status(400).json({ error: "Code and password are required" });

    try {
      const url = await Url.findOne({ urlCode: code, isDeleted: false });
      if (!url) return res.status(404).json({ error: "URL not found" });

      if (url.startDate && url.startDate > new Date()) {
        return res.status(403).json({ error: "URL is not active yet" });
      }
      if (url.expiresAt && url.expiresAt < new Date()) {
        return res.status(410).json({ error: "URL has expired" });
      }

      if (!url.password) return res.json({ originalUrl: url.originalUrl });

      const isMatch = await bcrypt.compare(password, url.password);
      if (!isMatch)
        return res.status(401).json({ error: "Incorrect password" });

      await recordClick(req, url._id);
      return res.json({ originalUrl: url.originalUrl });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  },
);

// Get Analytics
app.get(
  "/analytics/:code",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { code } = req.params;
      const url = await Url.findOne({ urlCode: code, isDeleted: false });
      if (!url) return res.status(404).json({ error: "URL not found" });

      const clicks = await Click.find({ urlId: url._id }).sort({
        timestamp: 1,
      });

      const totalClicks = clicks.length;

      const browsers: Record<string, number> = {};
      const os: Record<string, number> = {};
      const devices: Record<string, number> = {};
      const clicksByDate: Record<string, number> = {};

      clicks.forEach((click) => {
        browsers[click.browser] = (browsers[click.browser] || 0) + 1;
        os[click.os] = (os[click.os] || 0) + 1;
        devices[click.device] = (devices[click.device] || 0) + 1;

        const dateStr = click.timestamp.toISOString().split("T")[0];
        clicksByDate[dateStr] = (clicksByDate[dateStr] || 0) + 1;
      });

      const chartData = Object.keys(clicksByDate).map((date) => ({
        date,
        clicks: clicksByDate[date],
      }));

      return res.json({
        totalClicks,
        browsers,
        os,
        devices,
        chartData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  },
);

// Get User URLs
app.get(
  "/api/urls",
  protect,
  async (req: AuthRequest, res: Response): Promise<any> => {
    try {
      const { status, search, type, page = 1, limit = 5 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let query: any = {
        userId: req.user?.id,
        isDeleted: false,
      };

      const conditions: any[] = [];

      if (status === "active") {
        conditions.push({
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } },
          ],
        });
      } else if (status === "expired") {
        conditions.push({ expiresAt: { $lt: new Date() } });
      }

      if (type === "protected") {
        conditions.push({ password: { $exists: true, $nin: [null, ""] } });
      } else if (type === "expiry") {
        conditions.push({ expiresAt: { $exists: true, $ne: null } });
      } else if (type === "qr") {
        conditions.push({ isQr: true });
      } else if (type === "custom") {
        conditions.push({ isCustom: true });
      } else if (type === "normal") {
        conditions.push({
          $and: [
            { $or: [{ password: { $exists: false } }, { password: null }, { password: "" }] },
            { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }] },
            { isQr: { $ne: true } },
            { isCustom: { $ne: true } }
          ]
        });
      }

      if (search) {
        conditions.push({
          $or: [
            { originalUrl: { $regex: search, $options: "i" } },
            { urlCode: { $regex: search, $options: "i" } },
          ],
        });
      }

      if (conditions.length > 0) {
        query.$and = conditions;
      }

      const totalUrls = await Url.countDocuments(query);
      const urls = await Url.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const urlsWithClicks = await Promise.all(
        urls.map(async (url) => {
          const clicks = await Click.countDocuments({ urlId: url._id });
          return { ...url.toObject(), clicks };
        })
      );

      // Get overall stats for the user
      const allUserUrls = await Url.find({ userId: req.user?.id, isDeleted: false });
      const stats = {
        total: allUserUrls.length,
        active: allUserUrls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length,
        expired: allUserUrls.filter(u => u.expiresAt && new Date(u.expiresAt) < new Date()).length,
        protected: allUserUrls.filter(u => u.password).length
      };

      return res.json({
        urls: urlsWithClicks,
        total: totalUrls,
        pages: Math.ceil(totalUrls / Number(limit)),
        currentPage: Number(page),
        stats
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  },
);

// Soft Delete URL
app.delete(
  "/api/urls/:id",
  protect,
  async (req: AuthRequest, res: Response): Promise<any> => {
    try {
      const url = await Url.findOne({
        _id: req.params.id,
        userId: req.user?.id,
      });
      if (!url)
        return res.status(404).json({ error: "URL not found or unauthorized" });

      url.isDeleted = true;
      await url.save();

      return res.json({ message: "URL deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  },
);

app.get("/", (req: Request, res: Response) => {
  res.send("URL Shortener API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
