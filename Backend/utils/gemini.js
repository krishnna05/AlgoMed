require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getGeminiResponse(message) {
    try {
        console.log("➡️ Gemini request:", message);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const result = await model.generateContent(message);
        const text = result.response.text();

        console.log("✅ Gemini success");
        return text;

    } catch (err) {
        console.error("❌ Gemini FULL error:", err);
        return "AI service is temporarily unavailable.";
    }
}

module.exports = getGeminiResponse;
