import { Request, Response } from "express";
import { prisma } from "../index";
import { successResponse, errorResponse } from "../utils/helpers";

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
        });
        return res.json(successResponse(categories, "Categories fetched successfully"));
    } catch (error: any) {
        console.error("Get categories error:", error);
        return res.status(500).json(errorResponse("Failed to fetch categories"));
    }
};

export const getAllMedicines = async (req: Request, res: Response) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;

        const where: any = {};

        if (category) {
            where.categoryId = category as string;
        }

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: "insensitive" } },
                { description: { contains: search as string, mode: "insensitive" } },
            ];
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice as string);
            if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
        }

        const medicines = await prisma.medicine.findMany({
            where,
            include: {
                category: true,
                seller: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.json(successResponse(medicines, "Medicines fetched successfully"));
    } catch (error: any) {
        console.error("Get medicines error:", error);
        return res.status(500).json(errorResponse("Failed to fetch medicines"));
    }
};

export const getMedicineById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const medicine = await prisma.medicine.findUnique({
            where: { id },
            include: {
                category: true,
                seller: {
                    select: { name: true },
                },
            },
        });

        if (!medicine) {
            return res.status(404).json(errorResponse("Medicine not found"));
        }

        return res.json(successResponse(medicine, "Medicine details fetched successfully"));
    } catch (error: any) {
        console.error("Get medicine by id error:", error);
        return res.status(500).json(errorResponse("Failed to fetch medicine details"));
    }
};

export const addReview = async (req: any, res: Response) => {
    try {
        const { medicineId, rating, comment } = req.body;
        const customerId = req.user?.id;

        if (!medicineId || !rating || !customerId) {
            return res.status(400).json(errorResponse("MedicineId and rating are required"));
        }

        const review = await prisma.review.create({
            data: {
                medicineId,
                customerId,
                rating: parseInt(rating),
                comment,
            },
        });

        return res.status(201).json(successResponse(review, "Review added successfully"));
    } catch (error: any) {
        console.error("Add review error:", error);
        return res.status(500).json(errorResponse("Failed to add review"));
    }
};
