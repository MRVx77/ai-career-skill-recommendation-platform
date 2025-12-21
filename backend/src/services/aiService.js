import axios from "axios";

export const generateAIRecommendations = async ({
  skills,
  interests,
  preferredRole,
}) => {
  const prompt = `
    You are an expert career advisor.

    User Profile:
    Skills: ${skills.join(", ")}
    Interests: ${interests.join(", ")}
    Preferred Role: ${preferredRole}

    IMPORTANT RULES:
    - Respond ONLY with valid JSON
    - Do NOT add any explanation or text outside JSON
    - Do NOT use markdown
    - Do NOT use headings like "Roles:" or "Roadmap:"
    - Output MUST start with { and end with }
    - A make roadmap a bit detailed and between 6-10 steps

    JSON FORMAT:
    {
      "roles": ["role1", "role2", "role3", "role4", "role5"],
      "missingSkills": ["skill1", "skill2", "skill3"],
      "roadmap": ["step1", "step2", "step3"]
    }
    `;

  const messages = [
    {
      role: "system",
      content:
        "You are a career advisor AI. ALWAYS respond ONLY in valid JSON format, no explanations.",
    },
    { role: "user", content: prompt },
  ];

  const maxRetries = 3;
  let attempts = 0;
  let parsed = null;

  while (attempts < maxRetries && !parsed) {
    attempts++;
    try {
      const response = await axios.post(
        "https://router.huggingface.co/v1/chat/completions",
        {
          model: "openai/gpt-oss-120b:groq",
          messages,
          max_tokens: 1200, // increase tokens for long responses
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const generatedText =
        response.data.choices?.[0]?.message?.content?.trim() ||
        response.data.choices?.[0]?.message?.reasoning?.trim() ||
        "{}";

      try {
        parsed = JSON.parse(generatedText);
      } catch {
        // Invalid JSON, will retry
        console.warn("Invalid JSON, retrying...", attempts);
      }
    } catch (error) {
      console.error(
        "Hugging Face API Error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to generate AI recommendations.");
    }
  }

  // fallback in case all retries fail
  if (!parsed) parsed = { roles: [], missingSkills: [], roadmap: [] };

  return parsed;
};
