const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Модел Medication
 * Съхранява информация за лекарствата, графика на прием и контактите за известяване.
 */
const Medication = sequelize.define('Medication', {
    // ID на потребителя, за връзка с User таблицата
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // Имейл на потребителя, на който ще се праща първото напомняне
    userEmail: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
            isEmail: true
        }
    },

    // Имейл на близък човек, ако потребителят не отбележи, че е взел хапчето
    emergencyEmail: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
            isEmail: true
        }
    },

    // Име на лекарството
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },

    // Количество
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