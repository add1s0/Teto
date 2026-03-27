const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Модел Medication
 * Съхранява информация за лекарствата и графика на прием.
 * Имейлите се взимат от User таблицата.
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

    // Час на прием
    time: {
        type: DataTypes.TIME,
        allowNull: false
    },

    // Дали е взето
    isTaken: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // Кога е пратено първото напомняне
    lastNotified: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // За коя дата е пратено последното напомняне
    lastReminderDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    // Дали е пратен email на emergency contact
    emergencyNotified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // Кога е отбелязано като изпито
    takenAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Medication;