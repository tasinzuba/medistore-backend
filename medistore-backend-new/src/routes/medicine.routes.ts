import { Router } from "express";
import { getAllMedicines, getMedicineById, getCategories, addReview } from "../controllers/medicine.controller";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/categories", getCategories);
router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);

router.post("/reviews", authMiddleware, addReview);

export default router;
