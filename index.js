require('dotenv').config(); // ЗАДЪЛЖИТЕЛНО НА ПЪРВИ РЕД
const express = require('express');
const path = require('path');
const sequelize = require('./config/db');

// 1. Внос на моделите
const User = require('./models/User'); 
const Medication = require('./models/Medication');
const Event = require('./models/Event');
const MedicineReference = require('./models/MedicineReference');

// 2. Внос на маршрутите
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const medsRoutes = require('./routes/meds'); // Добавено за MedRemind

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 3. ДЕФИНИРАНЕ НА ВРЪЗКИ (Associations) - КРИТИЧНО ЗА DB ADMIN!
// Потребител -> Лекарства
User.hasMany(Medication, { foreignKey: 'userId', onDelete: 'CASCADE' });
Medication.belongsTo(User, { foreignKey: 'userId' });

// Потребител -> Събития (MyCondition)
User.hasMany(Event, { foreignKey: 'userId', onDelete: 'CASCADE' });
Event.belongsTo(User, { foreignKey: 'userId' });

// 4. Регистрация на маршрути
app.use('/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/meds', medsRoutes);

// Главна страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

const PORT = process.env.PORT || 3000;

// 5. Синхронизация и старт
sequelize.sync({ alter: true }) 
    .then(() => {
        console.log('✅ Database synced & Tables updated');
        console.log('🔑 AI Key status:', process.env.OPENAI_API_KEY ? "Loaded" : "MISSING");
        app.listen(PORT, () => {
            console.log(`🚀 Server running: http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('❌ Connection error:', err));