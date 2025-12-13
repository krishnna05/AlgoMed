require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiResponse = async (message) => {
    const models = ["gemini-1.5-pro", "gemini-1.5-flash"];

    for (const modelName of models) {
        try {
            console.log(`Attempting with model: ${modelName}...`);

            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(message);
            const response = await result.response;
            const text = response.text();

            return text;

        } catch (err) {
            console.warn(`Model ${modelName} failed:`, err.message);
            
            if (modelName === models[models.length - 1]) {
                return "Sorry, I am unable to process your request with any available models.";
            }
        }
    }
};

module.exports = getGeminiResponse;