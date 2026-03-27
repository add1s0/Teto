const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SymptomReference = sequelize.define('SymptomReference', {
    name: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true 
    },
    category: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    severity_level: { 
        type: DataTypes.INTEGER,
        defaultValue: 1 // 1: Леко, 2: Умерено, 3: Спешно
    }
}, {
    tableName: 'SymptomReference', // Име на таблицата в базата
    freezeTableName: true,         // Спира автоматичното превръщане в множествено число
    timestamps: true 
});

module.exports = SymptomReference;