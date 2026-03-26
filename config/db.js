const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS, 
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        port: process.env.DB_PORT || 5432, // Портът на PostgreSQL
        logging: false
    }
);

// Тестова функция, за да сме 100% сигурни в терминала
sequelize.authenticate()
    .then(() => console.log('✨ Връзката с PostgreSQL е бетон!'))
    .catch(err => console.error('❌ Опа! Грешка при свързване с базата:', err));

module.exports = sequelize;