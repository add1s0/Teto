const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
    type: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }, 
    title: { 
        type: DataTypes.STRING,
        allowNull: true
    }, 
    description: { 
        type: DataTypes.TEXT,
        allowNull: true
    }, 
    value: { 
        type: DataTypes.STRING,
        allowNull: true
    }, 
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    }
}, {
    timestamps: true 
});

module.exports = Event;