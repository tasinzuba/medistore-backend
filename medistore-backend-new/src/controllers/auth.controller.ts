import { Response } from "express";
import { prisma } from "../index";
import { AuthRequest, generateToken } from "../lib/auth";
import {
    hashPassword,
    verifyPassword,
    validateEmail,
    validatePassword,
} from "../utils/validators";
import { successResponse, errorResponse } from "../utils/helpers";

export const register = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name, phone, role } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json(errorResponse("Email, password, and name are required"));
        }

        if (!validateEmail(email)) {
            return res.status(400).json(errorResponse("Invalid email format"));
        }

        if (!validatePassword(password)) {
            return res.status(400).json(errorResponse("Password must be at least 6 characters long"));
        }

        const validRoles = ["CUSTOMER", "SELLER"];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json(errorResponse("Invalid role. Must be CUSTOMER or SELLER"));
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json(errorResponse("User already exists with this email"));
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || "CUSTOMER",
            },
        });

        const token = generateToken(user.id, user.email, user.role);

        return res.status(201).json(
            successResponse(
                {
                    user: { id: user.id, email: user.email, name: user.name, role: user.role },
                    token,
                },
                "User registered successfully"
            )
        );
    } catch (error: any) {
        console.error("Register error:", error);
        return res.status(500).json(errorResponse("Registration failed"));
    }
};

export const login = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json(errorResponse("Email and password are required"));
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json(errorResponse("Invalid email or password"));
        }

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json(errorResponse("Invalid email or password"));
        }

        const token = generateToken(user.id, user.email, user.role);

        return res.json(
            successResponse(
                {
                    user: { id: user.id, email: user.email, name: user.name, role: user.role },
                    token,
                },
                "Login successful"
            )
        );
    } catch (error: any) {
        console.error("Login error:", error);
        return res.status(500).json(errorResponse("Login failed"));
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json(errorResponse("Unauthorized"));
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json(errorResponse("User not found"));
        }

        return res.json(successResponse(user, "User fetched successfully"));
    } catch (error: any) {
        console.error("Get me error:", error);
        return res.status(500).json(errorResponse("Failed to fetch user"));
    }
};
