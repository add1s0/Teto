const { Sequelize } = require('sequelize');
require('dotenv').config();

// 1. Проверка в конзолата (за да сме сигурни, че чете от .env)
console.log("--- Проверка на конфигурацията ---");
console.log("DB Name:", process.env.DB_NAME);
console.log("DB User:", process.env.DB_USER);
console.log("DB Pass:", process.env.DB_PASS ? "✅ Намерена" : "❌ ЛИПСВА (Провери .env файла!)");
console.log("----------------------------------");

// 2. Инициализация на Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS, 
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        port: process.env.DB_PORT || 5432,
        logging: false, // за да не пълни терминала с излишни логвания
        define: {
            timestamps: true // гарантира, че ще търси createdAt и updatedAt
        }
    }
);

// 3. Тест на връзката
sequelize.authenticate()
    .then(() => {
        console.log('✨ Връзката с PostgreSQL е бетон!');
    })
    .catch(err => {
        console.error('❌ Опа! Грешка при свързване с базата:', err.message);
    });

module.exports = sequelize;