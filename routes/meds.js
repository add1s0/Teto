const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const MedicineReference = require('../models/MedicineReference');
const Medication = require('../models/Medication');

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(to, subject, html) {
    await transporter.sendMail({
        from: `"MedGuide" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
}

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
        const { userEmail, emergencyEmail, name, dosage, time } = req.body;

        if (!userEmail || !emergencyEmail || !name || !time) {
            return res.status(400).json({
                error: 'Липсват задължителни полета'
            });
        }

        const newMedication = await Medication.create({
            userEmail,
            emergencyEmail,
            name,
            dosage,
            time,
            isTaken: false,
            lastNotified: null,
            emergencyNotified: false,
            takenAt: null
        });

        res.status(201).json(newMedication);
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
        const meds = await Medication.findAll();
        res.json(meds);
    } catch (error) {
        console.error('Грешка при зареждане:', error);
        res.status(500).json({ error: 'Сървърна грешка' });
    }
});

// ⏰ Проверка всяка минута
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM

        const medications = await Medication.findAll();

        for (const med of medications) {
            const medTime = String(med.time).slice(0, 5);

            // 1. Праща email на потребителя в точния час
            if (medTime === currentTime && !med.lastNotified) {
                await sendEmail(
                    med.userEmail,
                    `Напомняне за ${med.name}`,
                    `
                        <h2>Време е за лекарство</h2>
                        <p>Лекарство: <b>${med.name}</b></p>
                        <p>Доза: <b>${med.dosage || 'няма зададена'}</b></p>
                        <p>Час: <b>${medTime}</b></p>
                        <p>Отбележи в приложението, ако вече си го приел/а.</p>
                    `
                );

                med.lastNotified = new Date();
                med.isTaken = false;
                med.emergencyNotified = false;
                med.takenAt = null;
                await med.save();
            }

            // 2. След 15 минути праща на emergency contact, ако не е отбелязано
            if (med.lastNotified && !med.isTaken && !med.emergencyNotified) {
                const fifteenMinutesLater = new Date(
                    new Date(med.lastNotified).getTime() + 15 * 60 * 1000
                );

                if (now >= fifteenMinutesLater) {
                    await sendEmail(
                        med.emergencyEmail,
                        `Спешно известие за пропуснато лекарство`,
                        `
                            <h2>Непотвърден прием на лекарство</h2>
                            <p>Потребителят не е отбелязал, че е приел:</p>
                            <p><b>${med.name}</b></p>
                            <p>Час на прием: <b>${medTime}</b></p>
                        `
                    );

                    med.emergencyNotified = true;
                    await med.save();
                }
            }
        }
    } catch (error) {
        console.error('Грешка в cron логиката:', error);
    }
});

module.exports = router;