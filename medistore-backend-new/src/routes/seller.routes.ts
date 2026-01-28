import { Router } from "express";
import {
    addMedicine,
    getSellerMedicines,
    updateMedicine,
    deleteMedicine,
    getSellerOrders,
    updateOrderStatus,
} from "../controllers/seller.controller";
import { authMiddleware, roleMiddleware } from "../lib/auth";

const router = Router();

router.use(authMiddleware, roleMiddleware(["SELLER", "ADMIN"]));

router.post("/medicines", addMedicine);
router.get("/medicines", getSellerMedicines);
router.put("/medicines/:id", updateMedicine);
router.delete("/medicines/:id", deleteMedicine);
router.get("/orders", getSellerOrders);
router.patch("/orders/:id", updateOrderStatus);

export default router;
