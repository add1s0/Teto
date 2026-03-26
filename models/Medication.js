const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Medication = sequelize.define('Medication', {
    name: { type: DataTypes.STRING, allowNull: false },
    dosage: { type: DataTypes.STRING },
    time: { type: DataTypes.TIME, allowNull: false },
    isTaken: { type: DataTypes.BOOLEAN, defaultValue: false },
    userId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Medication; // ВАЖНО: Провери дали този ред го има