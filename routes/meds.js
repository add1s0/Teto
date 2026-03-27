const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const MedicineReference = require('../models/MedicineReference');
const Medication = require('../models/Medication');
const User = require('../models/User');

// 🔍 API за Autocomplete
router.get('/search', async (req, res) => {
    try {
        const searchTerm = req.query.term;

        if (!searchTerm || searchTerm.length < 2) {
            return res.json([]);
        }

        const results = await MedicineReference.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${searchTerm}%`
                }
            },
            limit: 10
        });

        res.json(results);
    } catch (error) {
        console.error('Грешка при търсене:', error);
        res.status(500).json({ error: 'Сървърна грешка' });
    }
});

// 💊 API за добавяне на лично напомняне
router.post('/add', async (req, res) => {
    try {
        const { userId, name, dosage, time } = req.body;

        if (!userId || !name || !time) {
            return res.status(400).json({
                error: 'Липсват задължителни полета'
            });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                error: 'Потребителят не е намерен'
            });
        }

        const newMedication = await Medication.create({
            userId,
            name,
            dosage,
            time,
            isTaken: false,
            lastNotified: null,
            lastReminderDate: null,
            emergencyNotified: false,
            takenAt: null
        });

        res.status(201).json({
            success: true,
            message: 'Лекарството е добавено успешно',
            medication: newMedication
        });
    } catch (error) {
        console.error('Грешка при запис:', error);
        res.status(500).json({ error: 'Неуспешно добавяне на лекарство' });
    }
});

// ✅ Отбелязване, че хапчето е изпито
router.post('/taken/:id', async (req, res) => {
    try {
        const medication = await Medication.findByPk(req.params.id);

        if (!medication) {
            return res.status(404).json({ error: 'Лекарството не е намерено' });
        }

        medication.isTaken = true;
        medication.takenAt = new Date();
        await medication.save();

        res.json({
            success: true,
            message: 'Лекарството е отбелязано като изпито'
        });
    } catch (error) {
        console.error('Грешка при отбелязване:', error);
        res.status(500).json({ error: 'Сървърна грешка' });
    }
});

// 📋 Връщане на всички лекарства
router.get('/', async (req, res) => {
    try {
        const meds = await Medication.findAll({
            include: [
                {
                    model: User,
                    attributes: [
                        'id',
                        'firstName',
                        'lastName',
                        'email',
                        'emergencyEmail'
                    ]
                }
            ]
        });

        res.json(meds);
    } catch (error) {
        console.error('Грешка при зареждане:', error);
        res.status(500).json({ error: 'Сървърна грешка' });
    }
});

module.exports = router;