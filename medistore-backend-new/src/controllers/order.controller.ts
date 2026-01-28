import { Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../lib/auth";
import { successResponse, errorResponse } from "../utils/helpers";

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { items, shippingAddress } = req.body;
        const customerId = req.user?.id;

        if (!items || !items.length || !shippingAddress || !customerId) {
            return res.status(400).json(errorResponse("Items and shipping address are required"));
        }

        // Calculate total price and verify stock
        let totalPrice = 0;
        const orderItemsData: { medicineId: string; quantity: number; price: number }[] = [];

        for (const item of items) {
            const medicine = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
            if (!medicine) {
                return res.status(404).json(errorResponse(`Medicine ${item.medicineId} not found`));
            }
            if (medicine.stock < item.quantity) {
                return res.status(400).json(errorResponse(`Insufficient stock for ${medicine.name}`));
            }

            totalPrice += medicine.price * item.quantity;
            orderItemsData.push({
                medicineId: medicine.id,
                quantity: item.quantity,
                price: medicine.price,
            });
        }

        // Create order in transaction
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    customerId,
                    totalPrice,
                    shippingAddress,
                    items: {
                        create: orderItemsData,
                    },
                },
                include: { items: true },
            });

            // Update medicine stocks
            for (const item of orderItemsData) {
                await tx.medicine.update({
                    where: { id: item.medicineId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            return newOrder;
        });

        return res.status(201).json(successResponse(order, "Order placed successfully"));
    } catch (error: any) {
        console.error("Create order error:", error);
        return res.status(500).json(errorResponse("Failed to place order"));
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        const customerId = req.user?.id;
        const orders = await prisma.order.findMany({
            where: { customerId },
            include: {
                items: {
                    include: { medicine: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return res.json(successResponse(orders, "Orders fetched successfully"));
    } catch (error: any) {
        console.error("Get my orders error:", error);
        return res.status(500).json(errorResponse("Failed to fetch orders"));
    }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const customerId = req.user?.id;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: { medicine: true },
                },
            },
        });

        if (!order || order.customerId !== customerId) {
            return res.status(404).json(errorResponse("Order not found or access denied"));
        }

        return res.json(successResponse(order, "Order details fetched successfully"));
    } catch (error: any) {
        console.error("Get order error:", error);
        return res.status(500).json(errorResponse("Failed to fetch order details"));
    }
};
