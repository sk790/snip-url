import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import {
  Scissors,
  Sparkles,
  Link as LinkIcon,
  Calendar,
  QrCode,
  Clock,
  Shield,
  AlertCircle,
  Loader2,
  ArrowRight,
  History,
  Copy,
  Check,
  X,
  Eye,
  EyeOff,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Trash2,
} from "lucide-react";
import DatePicker from "react-datepicker";
import { QRCodeSVG } from "qrcode.react";
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";
import { AuthModal } from "./AuthModal";
import { ConfirmModal } from "./ConfirmModal";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Dashboard } from "./Dashboard";

const Meteors = ({ number = 40 }) => {
  const meteors = new Array(number).fill(true);
  return (
    <div className="meteor-container">
      {meteors.map((_, idx) => (
        <span
          key={idx}
          className="meteor"
          style={{
            top: -50 + "px",
            left: Math.floor(Math.random() * 200 - 100) + "vw",
            animationDelay: Math.random() * 5 + "s",
            animationDuration: Math.random() * 5 + 3 + "s",
          }}
        />
      ))}
    </div>
  );
};

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generateQrCode, setGenerateQrCode] = useState(false);
  const [showCustomLink, setShowCustomLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [customUrlCode, setCustomUrlCode] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [copiedHistoryIndex, setCopiedHistoryIndex] = useState<number | null>(
    null,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved === null ? true : JSON.parse(saved);
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isUnlockPasswordVisible, setIsUnlockPasswordVisible] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  const queryParams = new URLSearchParams(window.location.search);
  const unlockCode = queryParams.get("unlock");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    const fetchUserUrls = async () => {
      const token = localStorage.getItem("token");
      if (token && user) {
        try {
          const response = await axios.get("http://localhost:3000/api/urls", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setHistory(response.data.urls || []);
        } catch (err) {
          console.error("Failed to fetch user URLs", err);
        }
      }
    };
    fetchUserUrls();
  }, [user]);

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setHistory([]);
    setLogoutModalOpen(false);
    window.location.href = "/";
  };

  const handleHistoryCopy = (shortUrl: string, index: number) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedHistoryIndex(index);
    setTimeout(() => setCopiedHistoryIndex(null), 2000);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:3000/api/urls/${deletingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory((prev) => prev.filter((item) => item._id !== deletingId));
      setDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete URL", err);
      alert("Failed to delete URL");
    } finally {
      setIsDeleting(false);
    }
  };

  const [sidebarWidth, setSidebarWidth] = useState(340);
  const isResizing = useRef(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError("");
    setShortUrl("");
    setCopied(false);

    try {
      let formattedUrl = url;
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const response = await axios.post(
        "http://localhost:3000/shorten",
        {
          originalUrl: formattedUrl,
          startDate: showAdvanced ? startDate : undefined,
          expiresAt: showAdvanced ? expiresAt : undefined,
          password: showPassword ? password : undefined,
          customUrlCode: showCustomLink ? customUrlCode : undefined,
          isQr: generateQrCode,
        },
        config,
      );

      setShortUrl(response.data.shortUrl);
      if (history.length === 0) {
        setIsSidebarOpen(true);
      }
      setHistory((prev) => [
        {
          originalUrl: formattedUrl,
          shortUrl: response.data.shortUrl,
          urlCode: response.data.urlCode,
          createdAt: new Date(),
        },
        ...prev,
      ]);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to shorten URL. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockPassword) return;
    setUnlockLoading(true);
    setUnlockError("");
    try {
      const response = await axios.post(
        `http://localhost:3000/unlock/${unlockCode}`,
        {
          password: unlockPassword,
        },
      );
      window.location.href = response.data.originalUrl;
    } catch (err: any) {
      setUnlockError(err.response?.data?.error || "Incorrect password");
    } finally {
      setUnlockLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (unlockCode) {
    return (
      <div className="app-container">
        <div className="ambient-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <Meteors number={40} />
        <div className="auth-header-btn">
          {user ? (
            <div className="user-profile">
              <span className="user-name">{user.name}</span>
              <button
                onClick={handleLogoutClick}
                className="btn-logout"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-login"
            >
              <UserIcon size={18} />
              <span>Login</span>
            </button>
          )}
        </div>
        <header className="header">
          <h1 className="logo-text">
            <Shield size={48} strokeWidth={2.5} />
            Protected Link
          </h1>
          <p className="subtitle">Enter the password to access this URL.</p>
        </header>

        <div className="glass-card">
          <form onSubmit={handleUnlock} className="form-group">
            <div className="input-wrapper">
              <Shield className="input-icon" size={20} />
              <input
                type={isUnlockPasswordVisible ? "text" : "password"}
                className="url-input"
                placeholder="Enter password..."
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                disabled={unlockLoading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() =>
                  setIsUnlockPasswordVisible(!isUnlockPasswordVisible)
                }
              >
                {isUnlockPasswordVisible ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ justifyContent: "center" }}
              disabled={!unlockPassword || unlockLoading}
            >
              {unlockLoading ? (
                <Loader2 className="loading-icon" size={20} />
              ) : (
                <ArrowRight size={20} />
              )}
              Unlock Link
            </button>
          </form>
          {unlockError && (
            <div className="error-message">
              <AlertCircle size={16} />
              {unlockError}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{
        padding: isDashboard ? "0px" : "2rem",
        paddingLeft:
          isSidebarOpen && history.length > 0 && !isDashboard
            ? `calc(${sidebarWidth}px + 2rem)`
            : isDashboard
              ? "0px"
              : "2rem",
        width: "100%",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="ambient-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <Meteors number={40} />

      {!isDashboard && (
        <div className="auth-header-btn">
          {user ? (
            <div className="user-profile">
              <Link to="/dashboard" className="btn-dashboard">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <span className="user-name">{user.name}</span>
              <button
                onClick={handleLogoutClick}
                className="btn-logout"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-login"
            >
              <UserIcon size={18} />
              <span>Login</span>
            </button>
          )}
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <header className="hero-section">
                <h1 className="hero-title">
                  <Scissors className="hero-icon" size={64} strokeWidth={2.5} />
                  Snip<span className="text-gradient">URL</span>
                </h1>
                <p className="hero-subtitle">
                  Say goodbye to long, messy URLs. <br />
                  Create <span className="highlight-text">secure</span>,{" "}
                  <span className="highlight-text">trackable</span>, and{" "}
                  <span className="highlight-text">customizable</span> short
                  links in seconds.
                </p>
              </header>

              <div className="glass-card">
                <form onSubmit={handleSubmit} className="form-group-horizontal">
                  <div className="input-wrapper-horizontal">
                    <input
                      type="text"
                      className="url-input-horizontal"
                      placeholder="Paste your URL here... (e.g. https://mysite.com/very-long-page)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-horizontal"
                    disabled={!url || loading}
                  >
                    {loading ? (
                      <Loader2 className="loading-icon" size={20} />
                    ) : (
                      <Sparkles size={20} />
                    )}
                    Shorten Now
                  </button>
                </form>

                <div className="options-grid">
                  <div
                    className={`option-card ${showCustomLink ? "active" : ""}`}
                    onClick={() => setShowCustomLink(!showCustomLink)}
                  >
                    <div className="option-icon link-icon">
                      <LinkIcon size={24} />
                    </div>
                    <span>Custom Link</span>
                  </div>
                  <div
                    className={`option-card ${showPassword ? "active" : ""}`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <div className="option-icon shield-icon">
                      <Shield size={24} />
                    </div>
                    <span>Password Protection</span>
                  </div>
                  <div
                    className={`option-card ${showAdvanced ? "active" : ""}`}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <div className="option-icon calendar-icon">
                      <Calendar size={24} />
                    </div>
                    <span>Set Expiration</span>
                  </div>
                  <div
                    className={`option-card ${generateQrCode ? "active" : ""}`}
                    onClick={() => setGenerateQrCode(!generateQrCode)}
                  >
                    <div className="option-icon qr-icon">
                      <QrCode size={24} />
                    </div>
                    <span>Generate QR Code</span>
                  </div>
                </div>

                {showAdvanced && (
                  <div className="advanced-options">
                    <div className="input-wrapper">
                      <Clock className="input-icon" size={20} />
                      <DatePicker
                        selected={startDate}
                        onChange={(date: Date | null) => setStartDate(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        placeholderText="Optional: Set a start date and time"
                        className="url-input"
                        minDate={new Date()}
                        disabled={loading}
                        isClearable
                      />
                    </div>

                    <div className="input-wrapper">
                      <Calendar className="input-icon" size={20} />
                      <DatePicker
                        selected={expiresAt}
                        onChange={(date: Date | null) => setExpiresAt(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        placeholderText="Optional: Set an expiry date and time"
                        className="url-input"
                        minDate={new Date()}
                        disabled={loading}
                        isClearable
                      />
                    </div>
                  </div>
                )}

                {showCustomLink && (
                  <div className="advanced-options">
                    <div className="input-wrapper">
                      <LinkIcon className="input-icon" size={20} />
                      <div className="url-prefix-container">
                        <span className="url-prefix-text">
                          http://localhost:3000/
                        </span>
                        <input
                          type="text"
                          className="url-input-prefixed"
                          placeholder="my-cool-link"
                          value={customUrlCode}
                          onChange={(e) => setCustomUrlCode(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {showPassword && (
                  <div className="advanced-options">
                    <div className="input-wrapper">
                      <Shield className="input-icon" size={20} />
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        className="url-input"
                        placeholder="Enter password to protect this link"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      >
                        {isPasswordVisible ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {shortUrl && (
                  <div className="result-container">
                    <h3 className="result-title">
                      Your shortened URL is ready:
                    </h3>
                    <div className="short-url-box">
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="short-url-link"
                      >
                        {shortUrl}
                      </a>
                      <button
                        onClick={copyToClipboard}
                        className="btn-icon"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <Check
                            size={20}
                            className="success-message"
                            style={{ margin: 0 }}
                          />
                        ) : (
                          <Copy size={20} />
                        )}
                      </button>
                    </div>
                    {copied && (
                      <div className="success-message">
                        <Check size={14} /> Copied to clipboard!
                      </div>
                    )}

                    {generateQrCode && (
                      <div className="qr-code-container">
                        <h4 className="qr-title">Scan QR Code</h4>
                        <div className="qr-box">
                          <QRCodeSVG
                            value={shortUrl}
                            size={150}
                            fgColor="#ffffff"
                            bgColor="transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="features-section">
                <div className="feature-item">
                  <div className="feature-icon">
                    <Shield size={28} />
                  </div>
                  <h3>Secure & Private</h3>
                  <p>
                    Protect your links with robust passwords to ensure only
                    authorized users can access your shared content.
                  </p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <Clock size={28} />
                  </div>
                  <h3>Time-Bound Links</h3>
                  <p>
                    Set precise start and expiration dates for your campaigns.
                    Control exactly when your audience can click.
                  </p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <QrCode size={28} />
                  </div>
                  <h3>Instant QR Codes</h3>
                  <p>
                    Generate highly scannable QR codes for your short links
                    instantly. Perfect for offline marketing and print.
                  </p>
                </div>
              </div>

              <footer className="footer">
                <p>
                  &copy; {new Date().getFullYear()} SnipURL. Crafted with ❤️ for
                  seamless sharing.
                </p>
              </footer>

              {history.length > 0 && !isSidebarOpen && (
                <button
                  className="history-toggle-btn"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Open History"
                >
                  <History size={24} />
                  <span
                    key={history.length}
                    className="history-toggle-badge badge-bounce"
                  >
                    {history.length}
                  </span>
                </button>
              )}

              {history.length > 0 && isSidebarOpen && (
                <aside
                  className="history-sidebar"
                  style={{ width: `${sidebarWidth}px` }}
                >
                  <div
                    className="sidebar-resizer"
                    onMouseDown={startResizing}
                  />
                  <div className="history-header">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <h3>Recent Links</h3>
                      <span className="history-badge">{history.length}</span>
                    </div>
                    <button
                      className="btn-icon-small"
                      onClick={() => setIsSidebarOpen(false)}
                      title="Close Sidebar"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="history-list">
                    {history.map((item, index) => (
                      <div key={index} className="history-item">
                        <p
                          className="history-original"
                          title={item.originalUrl}
                        >
                          {item.originalUrl.length > 30
                            ? item.originalUrl.substring(0, 30) + "..."
                            : item.originalUrl}
                        </p>
                        <div className="history-short-row">
                          <a
                            href={item.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="history-short-link"
                          >
                            {item.shortUrl}
                          </a>
                          <button
                            onClick={() =>
                              handleHistoryCopy(item.shortUrl, index)
                            }
                            className={`history-copy-btn ${copiedHistoryIndex === index ? "copied" : ""}`}
                            title="Copy"
                          >
                            {copiedHistoryIndex === index ? (
                              <Check
                                size={16}
                                className="success-message"
                                style={{ margin: 0 }}
                              />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                          {user && item._id && (
                            <button
                              onClick={() => handleDeleteClick(item._id)}
                              className="history-copy-btn"
                              title="Delete Link"
                              style={{
                                marginLeft: "4px",
                                color: "var(--error)",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </aside>
              )}
            </>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this link? This action cannot be undone."
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
      />

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => setUser(user)}
        />
      )}
    </div>
  );
}

export default App;
