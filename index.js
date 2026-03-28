require('dotenv').config();
const express = require('express');
const path = require('path');


const dbPath = path.join(__dirname, 'config', 'db.js');
console.log('Опит за зареждане на База данни от:', dbPath);

const sequelize = require('./config/db');

const User = require('./models/User');
const Medication = require('./models/Medication');
const Event = require('./models/Event');
require('./models/MedicineReference');
require('./models/SymptomReference');

const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const medsRoutes = require('./routes/meds');
const symptomRoutes = require('./routes/symptom');

const { startMedicationReminderJob } = require('./services/medicationReminderService');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

User.hasMany(Medication, { foreignKey: 'userId', onDelete: 'CASCADE' });
Medication.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Event, { foreignKey: 'userId', onDelete: 'CASCADE' });
Event.belongsTo(User, { foreignKey: 'userId' });

app.use('/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/meds', medsRoutes);
app.use('/symptoms', symptomRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
    .then(() => {
        console.log('Връзка в PostgreSQL!');

        app.listen(PORT, () => {
            console.log(` Сървърът работи на http://localhost:${PORT}`);
            startMedicationReminderJob();
        });
    })
    .catch(err => {
        console.error(' ГРЕШКА ПРИ СТАРТ:', err.message);
    });