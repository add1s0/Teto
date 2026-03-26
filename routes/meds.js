const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); // Важно за търсенето
const MedicineReference = require('../models/MedicineReference');
const Medication = require('../models/Medication');

// 🔍 API за Autocomplete: Търси лекарства в справочника
router.get('/search', async (req, res) => {
    try {
        const searchTerm = req.query.term;
        if (!searchTerm || searchTerm.length < 2) {
            return res.json([]);
        }

        const results = await MedicineReference.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${searchTerm}%` // iLike работи в PostgreSQL за нечувствително към регистър търсене
                }
            },
            limit: 10 // Ограничаваме до 10 резултата
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
        const { name, dose, time, userId } = req.body;
        const newMedication = await Medication.create({
            name,
            dose,
            time,
            userId
        });
        res.status(201).json(newMedication);
    } catch (error) {
        console.error('Грешка при запис:', error);
        res.status(500).json({ error: 'Неуспешно добавяне на лекарство' });
    }
});

module.exports = router;