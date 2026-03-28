const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log("Проверка на конфигурацията");
console.log("DB Name:", process.env.DB_NAME);
console.log("DB User:", process.env.DB_USER);
console.log("DB Pass:", process.env.DB_PASS ? "Намерена" : "ЛИПСВА");
console.log("----------------------------------");

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS, 
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        port: process.env.DB_PORT || 5432,
        logging: false, 
        define: {
            timestamps: true 
        }
    }
);

sequelize.authenticate()
    .then(() => {
        console.log('Връзка с PostgreSQL.');
    })
    .catch(err => {
        console.error('Грешка при свързване с базата:', err.message);
    });

module.exports = sequelize;