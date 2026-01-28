import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends Request {
    user?: { id: string; email: string; role: string };
}

export const generateToken = (userId: string, email: string, role: string) => {
    return jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: "No token provided" });

        const decoded = verifyToken(token);
        if (!decoded) return res.status(401).json({ success: false, message: "Invalid or expired token" });

        req.user = decoded as any;
        next();
    } catch {
        res.status(401).json({ success: false, message: "Authentication failed" });
    }
};

export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Forbidden: You don't have access" });
        }
        next();
    };
};
