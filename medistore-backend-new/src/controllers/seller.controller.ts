import { Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../lib/auth";
import { successResponse, errorResponse } from "../utils/helpers";

export const addMedicine = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, price, stock, image, categoryId } = req.body;
        const sellerId = req.user?.id;

        if (!name || !price || !categoryId || !sellerId) {
            return res.status(400).json(errorResponse("Name, price, and category are required"));
        }

        const medicine = await prisma.medicine.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock) || 0,
                image,
                categoryId,
                sellerId,
            },
        });

        return res.status(201).json(successResponse(medicine, "Medicine added successfully"));
    } catch (error: any) {
        console.error("Add medicine error:", error);
        return res.status(500).json(errorResponse("Failed to add medicine"));
    }
};

export const getSellerMedicines = async (req: AuthRequest, res: Response) => {
    try {
        const sellerId = req.user?.id;
        const medicines = await prisma.medicine.findMany({
            where: { sellerId },
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });
        return res.json(successResponse(medicines, "Sellers medicines fetched successfully"));
    } catch (error: any) {
        console.error("Get seller medicines error:", error);
        return res.status(500).json(errorResponse("Failed to fetch medicines"));
    }
};

export const updateMedicine = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, image, categoryId } = req.body;
        const sellerId = req.user?.id;

        const medicine = await prisma.medicine.findUnique({ where: { id } });
        if (!medicine || medicine.sellerId !== sellerId) {
            return res.status(404).json(errorResponse("Medicine not found or access denied"));
        }

        const updatedMedicine = await prisma.medicine.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                stock: stock ? parseInt(stock) : undefined,
                image,
                categoryId,
            },
        });

        return res.json(successResponse(updatedMedicine, "Medicine updated successfully"));
    } catch (error: any) {
        console.error("Update medicine error:", error);
        return res.status(500).json(errorResponse("Failed to update medicine"));
    }
};

export const deleteMedicine = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const sellerId = req.user?.id;

        const medicine = await prisma.medicine.findUnique({ where: { id } });
        if (!medicine || medicine.sellerId !== sellerId) {
            return res.status(404).json(errorResponse("Medicine not found or access denied"));
        }

        await prisma.medicine.delete({ where: { id } });
        return res.json(successResponse(null, "Medicine deleted successfully"));
    } catch (error: any) {
        console.error("Delete medicine error:", error);
        return res.status(500).json(errorResponse("Failed to delete medicine"));
    }
};

// Placeholder for orders (will implement later in Order commit)
export const getSellerOrders = async (req: AuthRequest, res: Response) => {
    return res.json(successResponse([], "Seller orders fetched (placeholder)"));
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    return res.json(successResponse(null, "Order status updated (placeholder)"));
};
