import pg from "pg";
import { generateAIRecommendations } from "../services/aiService.js";
import { pool } from "../config/db.js";

export const getRecommendations = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "No body received!" });
  }
  const { skills, interests, preferredRole } = req.body;

  try {
    // AI response using Hugging Face
    const aiResponse = await generateAIRecommendations({
      skills,
      interests,
      preferredRole,
    });

    // Make sure the response has arrays even if AI failed
    const roles = Array.isArray(aiResponse.roles) ? aiResponse.roles : [];
    const missingSkills = Array.isArray(aiResponse.missingSkills)
      ? aiResponse.missingSkills
      : [];
    const roadmap = Array.isArray(aiResponse.roadmap) ? aiResponse.roadmap : [];

    // Save to DB
    await pool.query(
      `INSERT INTO recommendations (user_id, recommended_roles, missing_skills, roadmap, preferred_role) 
        VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        roles.join(", "),
        missingSkills.join(", "),
        roadmap.join(" | "),
        preferredRole,
      ]
    );

    res.json({ roles, missingSkills, roadmap });
  } catch (error) {
    console.error("Error generating recommendation:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMyRecommendations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM recommendations
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecommendationHistory = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM recommendations WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteRecommendation = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM recommendations WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    res.json({
      message: "Recommendation deleted",
      recommendation: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
