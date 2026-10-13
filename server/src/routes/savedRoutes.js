import express from "express";
import { getSaved, toggleSave } from "../controllers/savedController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", getSaved);
router.post("/:jobId", toggleSave);

export default router;
