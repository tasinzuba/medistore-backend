import { Router } from "express";
import { createOrder, getMyOrders, getOrderById } from "../controllers/order.controller";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.use(authMiddleware);

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

export default router;
