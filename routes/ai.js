const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Маршрут за "Generate Guide"
router.post('/generate-guide', async (req, res) => {
    const { condition } = req.body;
    if (!condition) return res.status(400).json({ error: "Въведете състояние" });

    try {
        const prompt = `Дай медицинска информация за: ${condition}. 
        Върни отговора САМО като JSON обект с ключове: 
        "bodyInfo" (какво става в тялото), 
        "expectInfo" (симптоми), 
        "doctorInfo" (въпроси към лекар), 
        "medInfo" (значение на лекарствата). 
        Език: Български.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (error) {
        console.error("AI Guide Error:", error);
        res.status(500).json({ error: "Грешка при AI генерирането" });
    }
});

// Маршрут за "Ask AI" Chat
router.post('/chat', async (req, res) => {
    const { message } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Ти си MedGuide AI асистент. Отговаряй кратко и точно на български." },
                { role: "user", content: message }
            ]
        });
        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: "Грешка при чат" });
    }
});

module.exports = router;