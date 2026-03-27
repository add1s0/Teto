const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const MedicineReference = require('../models/MedicineReference');
const Medication = require('../models/Medication');
const User = require('../models/User');

// 🔍 1. API ЗА ТЪРСЕНЕ (AUTOCOMPLETE)
// Използва се при добавяне на лекарство, за да предлага имена от справочника
// Път: GET /meds/search?term=...
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
        console.error('Грешка при търсене в справочника:', error);
        res.status(500).json({ error: 'Сървърна грешка при търсене' });
    }
});

// 💊 2. API ЗА ДОБАВЯНЕ НА ЛЕКАРСТВО
// Път: POST /meds/add
router.post('/add', async (req, res) => {
    try {
        const { userId, name, dosage, time } = req.body;

        if (!name || !time) {
            return res.status(400).json({ error: 'Името и часът са задължителни полета' });
        }

        // Използваме подадения userId или 1 по подразбиране за тестови цели
        const targetUserId = userId || 1;

        const newMedication = await Medication.create({
            userId: targetUserId,
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
        console.error('Грешка при запис на лекарство:', error);
        res.status(500).json({ error: 'Неуспешно добавяне на лекарство' });
    }
});

// ✅ 3. ОТБЕЛЯЗВАНЕ КАТО ИЗПИТО
// Път: POST /meds/taken/:id
router.post('/taken/:id', async (req, res) => {
    try {
        const medication = await Medication.findByPk(req.params.id);

        if (!medication) {
            return res.status(404).json({ error: 'Лекарството не е намерено' });
        }

        medication.isTaken = true;
        medication.takenAt = new Date(); // Записваме точното време на прием
        await medication.save();

        res.json({
            success: true,
            message: 'Лекарството е отбелязано като изпито'
        });
    } catch (error) {
        console.error('Грешка при обновяване на статус:', error);
        res.status(500).json({ error: 'Сървърна грешка при отбелязване' });
    }
});

// 📋 4. ИЗВЛИЧАНЕ НА ВСИЧКИ ЛЕКАРСТВА (За Dashboard)
// Път: GET /meds/all
router.get('/all', async (req, res) => {
    try {
        const meds = await Medication.findAll({
            order: [['time', 'ASC']], // Сортираме ги по час, за да изглеждат добре в графика
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'emergencyEmail']
                }
            ]
        });
        res.json(meds);
    } catch (error) {
        console.error('Грешка при извличане на списъка (all):', error);
        res.status(500).json({ error: 'Сървърна грешка при зареждане' });
    }
});

// 📋 5. АЛТЕРНАТИВЕН МАРШРУТ (Ако фронтендът търси просто /meds)
router.get('/', async (req, res) => {
    try {
        const meds = await Medication.findAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'emergencyEmail']
                }
            ]
        });
        res.json(meds);
    } catch (error) {
        console.error('Грешка при зареждане на лекарства:', error);
        res.status(500).json({ error: 'Сървърна грешка' });
    }
});

module.exports = router;