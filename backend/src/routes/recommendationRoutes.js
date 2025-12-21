import express from "express";
import {
  deleteRecommendation,
  getRecommendationHistory,
  getRecommendations,
} from "../controllers/recommendationController.js";
import { protect } from "../middleware/authMiddelware.js";

const router = express.Router();

router.post("/", protect, getRecommendations);
router.get("/", protect, getRecommendationHistory);
router.delete("/:id", protect, deleteRecommendation);

export default router;
