import { Router } from "express";
import {
    getAllUsers,
    updateUserStatus,
    createCategory,
    getDashboardStats,
} from "../controllers/admin.controller";
import { authMiddleware, roleMiddleware } from "../lib/auth";

const router = Router();

router.use(authMiddleware, roleMiddleware(["ADMIN"]));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.patch("/users/:id", updateUserStatus);
router.post("/categories", createCategory);

export default router;
