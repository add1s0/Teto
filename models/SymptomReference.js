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
    timestamps: true 
});

module.exports = SymptomReference;