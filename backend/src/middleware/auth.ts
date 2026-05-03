import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): any => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as any;
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error('JWT Verification error:', error);
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};
