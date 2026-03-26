const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

// Инициализираме Groq внимателно. 
// Ако ключът липсва, подаваме празен низ, за да не спре целия сървър при старт.
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "" 
});

// Маршрут за "Generate Guide"
router.post('/generate-guide', async (req, res) => {
    const { condition } = req.body;
    
    // Проверка дали ключът е наличен преди заявката
    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "AI модулът не е конфигуриран (липсва API Key)." });
    }

    if (!condition) return res.status(400).json({ error: "Моля, въведете състояние." });

    try {
        const prompt = `Ти си медицински асистент. Дай информация за: ${condition}. 
        Върни отговора САМО като JSON обект със следните ключове на български: 
        "bodyInfo" (какво става в тялото), 
        "expectInfo" (симптоми), 
        "doctorInfo" (въпроси към лекар), 
        "medInfo" (значение на лекарствата).`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Връщай само чист JSON формат на български." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const aiResponse = JSON.parse(chatCompletion.choices[0].message.content);
        res.json(aiResponse);

    } catch (error) {
        console.error("Groq Guide Error:", error);
        res.status(500).json({ error: "Грешка при генерирането с Groq. Проверете API ключа." });
    }
});

// Маршрут за Chat
router.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "Chat модулът не е активен." });
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Ти си MedGuide - любезен медицински асистент. Отговаряй винаги на български." },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile"
        });

        res.json({ reply: chatCompletion.choices[0].message.content });
    } catch (error) {
        console.error("Groq Chat Error:", error);
        res.status(500).json({ error: "Грешка в чата" });
    }
});

module.exports = router;