import { Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../lib/auth";
import { successResponse, errorResponse } from "../utils/helpers";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
        });
        return res.json(successResponse(users, "Users fetched successfully"));
    } catch (error: any) {
        console.error("Get all users error:", error);
        return res.status(500).json(errorResponse("Failed to fetch users"));
    }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["active", "blocked"].includes(status)) {
            return res.status(400).json(errorResponse("Invalid status. Must be active or blocked"));
        }

        const user = await prisma.user.update({
            where: { id },
            data: { status },
        });

        return res.json(successResponse(user, "User status updated successfully"));
    } catch (error: any) {
        console.error("Update user status error:", error);
        return res.status(500).json(errorResponse("Failed to update user status"));
    }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json(errorResponse("Name is required"));

        const category = await prisma.category.create({
            data: { name, description },
        });
        return res.status(201).json(successResponse(category, "Category created successfully"));
    } catch (error: any) {
        console.error("Create category error:", error);
        return res.status(500).json(errorResponse("Failed to create category"));
    }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const [userCount, medicineCount, orderCount, totalRevenue] = await Promise.all([
            prisma.user.count(),
            prisma.medicine.count(),
            prisma.order.count(),
            prisma.order.aggregate({ _sum: { totalPrice: true } }),
        ]);

        return res.json(successResponse({
            users: userCount,
            medicines: medicineCount,
            orders: orderCount,
            revenue: totalRevenue._sum.totalPrice || 0,
        }, "Dashboard stats fetched successfully"));
    } catch (error: any) {
        console.error("Dashboard stats error:", error);
        return res.status(500).json(errorResponse("Failed to fetch statistics"));
    }
};
