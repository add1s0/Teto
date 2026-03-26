const express = require('express');
const path = require('path');
const sequelize = require('./config/db');

// Импорт на твоите модели
const User = require('./models/User');
const Medication = require('./models/Medication');
const MedicineReference = require('./models/MedicineReference');
const Event = require('./models/Event');

// Импорт на маршрутите (от твоя скрийншот)
const authRoutes = require('./routes/auth');
const medsRoutes = require('./routes/meds');
const mapRoutes = require('./routes/map');
const aiRoutes = require('./routes/ai');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Дефиниране на връзките (Associations)
User.hasMany(Medication, { foreignKey: 'userId' });
Medication.belongsTo(User, { foreignKey: 'userId' });

// Свързване на маршрутите
app.use('/auth', authRoutes);
app.use('/meds', medsRoutes);
app.use('/map', mapRoutes);
app.use('/ai', aiRoutes);

// Синхронизация (Тук Sequelize създава таблиците в PostgreSQL)
sequelize.sync({ alter: true }).then(() => {
    console.log('✅ Таблиците са създадени. Базата е готова за данни!');
    app.listen(3000, () => console.log('🚀 Server running on port 3000'));
});