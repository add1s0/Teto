const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MedicineReference = sequelize.define('MedicineReference', {
    name: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true 
    },
    category: { 
        type: DataTypes.STRING 
    },
    description: { 
        type: DataTypes.TEXT 
    }
}, {
    // В seed.sql имаш NOW(), затова оставяме timestamps: true
    timestamps: true 
});

module.exports = MedicineReference;