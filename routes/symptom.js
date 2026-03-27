
const express = require('express');
const router = express.Router();
const SymptomReference = require('../models/SymptomReference');
const Event = require('../models/Event');
const { Op } = require('sequelize');

// 1. ТЕСТОВ МАРШРУТ
// Достъпен на: GET http://localhost:3000/api/symptoms/test
router.get('/test', (req, res) => {
    res.send('Бекендът на симптомите работи!');
});

// 2. ТЪРСЕНЕ (AUTO-COMPLETE)
// ВАЖНО: Тук пътят трябва да е само '/search'
// Пълният път автоматично става /api/symptoms/search
router.get('/search', async (req, res) => {
    try {
        const term = req.query.term || '';
        
        if (term.length < 1) {
            return res.json([]);
        }

        const symptoms = await SymptomReference.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${term}%` 
                }
            },
            attributes: ['id', 'name', 'category'],
            limit: 10,
            order: [['name', 'ASC']]
        });

        res.json(symptoms);
    } catch (error) {
        console.error('Грешка при търсене:', error);
        res.status(500).json({ error: 'Сървърна грешка' });
    }
});

// 3. ЗАПИСВАНЕ
// Пълният път: POST /api/symptoms/add
router.post('/add', async (req, res) => {
    try {
        const { symptoms } = req.body;
        const userId = 1; // Временно hardcoded

        if (!symptoms || !Array.isArray(symptoms)) {
            return res.status(400).json({ error: 'Невалидни данни' });
        }

        const records = symptoms.map(s => ({
            userId: userId,
            type: 'symptom',
            title: s.symptom,
            description: `Сила: ${s.severity}`,
            date: s.date,
            time: s.time
        }));

        await Event.bulkCreate(records);
        res.json({ success: true });
    } catch (error) {
        console.error('Грешка при запис:', error);
        res.status(500).json({ error: 'Грешка при запис' });
    }
});

module.exports = router;