import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { PrismaClient } from "@prisma/client";

import authRoutes from "./routes/auth.routes";
import medicineRoutes from "./routes/medicine.routes";
import sellerRoutes from "./routes/seller.routes";

dotenv.config();

export const prisma = new PrismaClient();

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/seller", sellerRoutes);


app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Welcome to MediStore API",
        status: "Service is up and running",
        version: "1.0.0"
    });
});

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
