require('dotenv').config();
const express = require('express');
const path = require('path');

// Проверка дали базата съществува преди зареждане
const dbPath = path.join(__dirname, 'config', 'db.js');
console.log('🔍 Опит за зареждане на БД от:', dbPath);

const sequelize = require('./config/db');

// 1. Внос на моделите
const User = require('./models/User'); 
const Medication = require('./models/Medication');
const Event = require('./models/Event');
const MedicineReference = require('./models/MedicineReference');

// 2. Внос на маршрутите
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const medsRoutes = require('./routes/meds');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 3. Връзки между таблиците
User.hasMany(Medication, { foreignKey: 'userId', onDelete: 'CASCADE' });
Medication.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Event, { foreignKey: 'userId', onDelete: 'CASCADE' });
Event.belongsTo(User, { foreignKey: 'userId' });

// 4. Маршрути
app.use('/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/meds', medsRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

const PORT = process.env.PORT || 3000;

// Синхронизация и старт
sequelize.sync({ alter: true })
    .then(() => {
        console.log('✨ Връзката с PostgreSQL е бетон!');
        app.listen(PORT, () => {
            console.log(`🚀 Сървърът работи на http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ ГРЕШКА ПРИ СТАРТ:', err.message);
    });