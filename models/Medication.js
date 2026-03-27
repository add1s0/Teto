const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Модел Medication
 * Съхранява информация за лекарствата и графика на прием.
 */
const Medication = sequelize.define('Medication', {
    // ID на потребителя, връзка към User таблицата
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // Име на лекарството
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    // Количество / доза
    dosage: {
        type: DataTypes.STRING,
        allowNull: true
    },

    // Час на прием (използваме TIME за по-лесна работа с графици)
    time: {
        type: DataTypes.TIME,
        allowNull: false
    },

    // Дали е взето за текущия ден
    isTaken: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // Кога е изпратено последното напомняне (за предотвратяване на дублирани имейли)
    lastNotified: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // За коя дата е пратено последното напомняне
    lastReminderDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    // Дали е пратен email на emergency contact при пропуск
    emergencyNotified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // Допълнителни инструкции (на гладно, след хранене и т.н.)
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    // Автоматично добавя createdAt и updatedAt
    timestamps: true
});

module.exports = Medication;