const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
    type: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }, // Тук ще записваме "symptom"
    title: { 
        type: DataTypes.STRING,
        allowNull: true
    }, // Тук ще отиде името на симптома (напр. "Главоболие")
    description: { 
        type: DataTypes.TEXT,
        allowNull: true
    }, // Тук ще отиде силата (напр. "Сила: 5/10")
    value: { 
        type: DataTypes.STRING,
        allowNull: true
    }, 
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    }
}, {
    timestamps: true // Генерира автоматично createdAt (важно за сортирането в Dashboard-а)
});

module.exports = Event;