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
    timestamps: true 
});

module.exports = MedicineReference;