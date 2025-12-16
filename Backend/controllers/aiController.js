const getGeminiResponse = require('../utils/gemini');

const generateSOAPNotes = async (req, res, next) => {
    try {
        const { text, patientAge, patientGender } = req.body;

        if (!text) {
            res.status(400);
            throw new Error('No text provided for analysis');
        }

        const prompt = `
        You are an expert medical scribe assistant. 
        Analyze the following raw doctor's notes or consultation transcript and convert it into a structured SOAP format.
        
        Patient Context: ${patientAge || 'Unknown'} years old, ${patientGender || 'Unknown'}.
        
        Raw Notes:
        "${text}"

        Output Instructions:
        1. Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.
        2. The JSON structure must be:
        {
            "subjective": "Patient's complaints, history, and symptoms...",
            "objective": "Physical exam findings, vitals discussed...",
            "assessment": "Likely diagnosis or differential diagnoses...",
            "plan": "Treatment plan, medications, follow-up...",
            "suggestedICD10": ["Code - Description", ...],
            "redFlags": ["Any critical warnings..."]
        }
        3. If a section is missing information, infer strictly from context or leave it as "Not mentioned".
        4. Keep the tone professional and clinical.
        `;

        const rawResponse = await getGeminiResponse(prompt);
        
        // Clean up response if it contains markdown code blocks
        const jsonString = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let structuredData;
        try {
            structuredData = JSON.parse(jsonString);
        } catch (parseError) {
            // Fallback if AI fails to return strict JSON
            structuredData = {
                subjective: rawResponse,
                objective: "",
                assessment: "",
                plan: "",
                suggestedICD10: [],
                redFlags: ["Error parsing AI response format"]
            };
        }

        res.status(200).json({
            success: true,
            data: structuredData
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { generateSOAPNotes };