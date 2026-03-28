const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Event = require('../models/Event');


router.get('/summary', async (req, res) => {
    try {
        const targetUserId = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        
        const recentEvents = await Event.findAll({
            where: { userId: targetUserId, type: 'symptom' },
            order: [['createdAt', 'DESC']],
            limit: 3
        });

        
        const countToday = await Event.count({
            where: {
                userId: targetUserId,
                type: 'symptom',
                createdAt: { [Op.gte]: today }
            }
        });

        res.json({
            success: true,
            recent: recentEvents,
            countToday: countToday
        });
    } catch (error) {
        console.error('Грешка при извличане на обобщение:', error);
        res.status(500).json({ error: 'Сървърна грешка' });
    }
});


router.post('/add', async (req, res) => {
    try {
        const { symptoms, userId } = req.body;
        const targetUserId = userId || 1;

        const records = symptoms.map(s => ({
            userId: targetUserId,
            type: 'symptom',
            title: s.symptom,
            description: `Сила: ${s.severity}. Време: ${s.date} ${s.time}`,
            createdAt: new Date()
        }));

        await Event.bulkCreate(records);
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Грешка при запис' });
    }
});

module.exports = router;