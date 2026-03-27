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

transporter.verify((error) => {
    if (error) {
        console.error('❌ Gmail transporter error:', error);
    } else {
        console.log('✅ Gmail transporter е готов за изпращане');
    }
});

async function sendEmail(to, subject, html) {
    try {
        const info = await transporter.sendMail({
            from: `"MedGuide" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log(`📨 Email изпратен към ${to}: ${info.response}`);
    } catch (error) {
        console.error(`❌ Грешка при изпращане към ${to}:`, error);
        throw error;
    }
}

function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatHHMM(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function getTodayScheduledDate(medTime) {
    const [hours, minutes] = medTime.split(':').map(Number);
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);
    return scheduled;
}

async function checkMedicationReminders() {
    try {
        const now = new Date();
        const currentTime = formatHHMM(now);
        const today = getTodayDateString();

        console.log(`\n⏰ Проверка в ${currentTime}, дата ${today}`);

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

        console.log(`💊 Намерени лекарства: ${medications.length}`);

        for (const med of medications) {
            const rawTime = med.time;
            const medTime = rawTime ? String(rawTime).slice(0, 5) : null;
            const fullName = `${med.User?.firstName || ''} ${med.User?.lastName || ''}`.trim();

            console.log('-------------------------');
            console.log(`Medication ID: ${med.id}`);
            console.log(`Name: ${med.name}`);
            console.log(`Raw DB time: ${rawTime}`);
            console.log(`Parsed medTime: ${medTime}`);
            console.log(`Current time: ${currentTime}`);
            console.log(`User ID: ${med.userId}`);
            console.log(`User email: ${med.User?.email}`);
            console.log(`Emergency email: ${med.User?.emergencyEmail}`);
            console.log(`lastReminderDate: ${med.lastReminderDate}`);
            console.log(`lastNotified: ${med.lastNotified}`);
            console.log(`isTaken: ${med.isTaken}`);
            console.log(`emergencyNotified: ${med.emergencyNotified}`);

            if (!medTime) {
                console.log('⚠️ Пропуснато: няма валиден час');
                continue;
            }

            // Основно напомняне
            if (medTime === currentTime && med.lastReminderDate !== today) {
                if (med.User && med.User.email) {
                    console.log(`📧 Пращам основно напомняне до ${med.User.email}`);

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
                } else {
                    console.log('❌ Няма user или user.email');
                }
            }

            // Emergency email - от 15-тата минута нататък, но само веднъж
            if (!med.isTaken && !med.emergencyNotified && med.lastReminderDate === today) {
                const scheduledTime = getTodayScheduledDate(medTime);
                const emergencyTime = new Date(scheduledTime.getTime() + 15 * 60 * 1000);
                const emergencyHHMM = formatHHMM(emergencyTime);

                console.log(`CHECK emergency for medication ${med.id}`);
                console.log(`now = ${now}`);
                console.log(`scheduledTime = ${scheduledTime}`);
                console.log(`emergencyTime = ${emergencyTime}`);
                console.log(`emergencyHHMM = ${emergencyHHMM}`);
                console.log(`currentTime = ${currentTime}`);
                console.log(`isTaken = ${med.isTaken}`);
                console.log(`emergencyNotified = ${med.emergencyNotified}`);
                console.log(`lastReminderDate = ${med.lastReminderDate}`);
                console.log(`user emergency email = ${med.User?.emergencyEmail}`);

                if (now >= emergencyTime) {
                    if (med.User && med.User.emergencyEmail) {
                        console.log(`⚠️ Пращам emergency email до ${med.User.emergencyEmail}`);

                        await sendEmail(
                            med.User.emergencyEmail,
                            'Спешно известие за пропуснато лекарство',
                            `
                                <h2>Непотвърден прием на лекарство</h2>
                                <p>Потребителят${fullName ? ' ' + fullName : ''} не е отбелязал, че е приел:</p>
                                <p><b>${med.name}</b></p>
                                <p>Час на прием: <b>${medTime}</b></p>
                                <p>Изминали са 15 минути без потвърждение.</p>
                            `
                        );

                        med.emergencyNotified = true;
                        await med.save();

                        console.log(`✅ Изпратено emergency известие към ${med.User.emergencyEmail}`);
                    } else {
                        console.log('❌ Липсва emergency email');
                    }
                }
            }
        }
    } catch (error) {
        console.error('❌ Грешка в reminder логиката:', error);
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