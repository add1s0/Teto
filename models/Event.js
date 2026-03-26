const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
    type: { type: DataTypes.STRING, allowNull: false }, // напр. "Blood Pressure", "Medication Taken"
    value: { type: DataTypes.STRING }, // напр. "120/80"
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    userId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Event; // ВАЖНО: Експорт