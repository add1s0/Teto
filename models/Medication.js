const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Medication = sequelize.define('Medication', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    dosage: {
        type: DataTypes.STRING,
        allowNull: true
    },

    time: {
        type: DataTypes.TIME,
        allowNull: false
    },

    isTaken: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    lastNotified: {
        type: DataTypes.DATE,
        allowNull: true
    },

    lastReminderDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    emergencyNotified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    
    timestamps: true
});

module.exports = Medication;