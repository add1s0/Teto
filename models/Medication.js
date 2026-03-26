const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Модел Medication
 * Съхранява информация за лекарствата, графика на прием и контактите за известяване.
 */
const Medication = sequelize.define('Medication', {
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
    // Име на лекарството (може да идва от Autocomplete списъка)
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    // Количество (напр. "1 таблетка", "5мл")
    dosage: { 
        type: DataTypes.STRING,
        allowNull: true 
    },
    // Час на прием (напр. "08:00")
    time: { 
        type: DataTypes.TIME, 
        allowNull: false 
    },
    // Статус дали е взето - ако остане false след определен час, се праща спешен имейл
    isTaken: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
    // Помага на логиката за имейли да знае кога последно е пратено известие
    lastNotified: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    // Автоматично добавя createdAt и updatedAt
    timestamps: true 
});

module.exports = Medication;