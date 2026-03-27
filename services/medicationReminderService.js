const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Medication = require('../models/Medication');
const User = require('../models/User');

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

function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function checkMedicationReminders() {
    try {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM
        const today = getTodayDateString();

        const medications = await Medication.findAll({
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

        for (const med of medications) {
            const medTime = String(med.time).slice(0, 5);
            const fullName = `${med.User?.firstName || ''} ${med.User?.lastName || ''}`.trim();

            // Основно напомняне към потребителя
            if (medTime === currentTime && med.lastReminderDate !== today) {
                if (med.User && med.User.email) {
                    await sendEmail(
                        med.User.email,
                        `Напомняне за ${med.name}`,
                        `
                            <h2>Време е за лекарство</h2>
                            <p>Здравей${fullName ? ', ' + fullName : ''}!</p>
                            <p>Лекарство: <b>${med.name}</b></p>
                            <p>Доза: <b>${med.dosage || 'няма зададена'}</b></p>
                            <p>Час: <b>${medTime}</b></p>
                            <p>Отбележи в приложението, ако вече си го приел/а.</p>
                        `
                    );

                    med.lastNotified = new Date();
                    med.lastReminderDate = today;
                    med.isTaken = false;
                    med.emergencyNotified = false;
                    med.takenAt = null;
                    await med.save();

                    console.log(`✅ Изпратено напомняне на ${med.User.email} за ${med.name}`);
                }
            }

            // След 15 минути email към emergency contact
            if (med.lastNotified && !med.isTaken && !med.emergencyNotified) {
                const fifteenMinutesLater = new Date(
                    new Date(med.lastNotified).getTime() + 15 * 60 * 1000
                );

                if (now >= fifteenMinutesLater) {
                    if (med.User && med.User.emergencyEmail) {
                        await sendEmail(
                            med.User.emergencyEmail,
                            'Спешно известие за пропуснато лекарство',
                            `
                                <h2>Непотвърден прием на лекарство</h2>
                                <p>Потребителят${fullName ? ' ' + fullName : ''} не е отбелязал, че е приел:</p>
                                <p><b>${med.name}</b></p>
                                <p>Час на прием: <b>${medTime}</b></p>
                            `
                        );

                        med.emergencyNotified = true;
                        await med.save();

                        console.log(`⚠️ Изпратено emergency известие към ${med.User.emergencyEmail}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Грешка в reminder логиката:', error);
    }
}

function startMedicationReminderJob() {
    cron.schedule('* * * * *', async () => {
        await checkMedicationReminders();
    });

    console.log('✅ Medication reminder job е стартиран');
}

module.exports = {
    startMedicationReminderJob
};