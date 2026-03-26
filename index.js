const express = require('express');
const path = require('path');
const sequelize = require('./config/db');
require('dotenv').config();

const User = require('./models/User'); 
const Medication = require('./models/Medication');
const Event = require('./models/Event');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }) 
    .then(() => {
        console.log('Database synced');
        app.listen(PORT, () => {
            console.log(` Server: http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('Connection error:', err));