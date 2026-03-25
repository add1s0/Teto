const express = require('express');
const path = require('path');
const sequelize = require('./config/db');
require('dotenv').config();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Тест на връзката
sequelize.authenticate()
    .then(() => console.log('Връзката с PostgreSQL е успешна'))
    .catch(err => console.error('Грешка:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));