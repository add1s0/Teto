const express = require('express');
const router = express.Router();

// Примерен маршрут, за да не е празен файла
router.get('/', (req, res) => {
    res.json({ message: "Тук ще бъдат лекарствата" });
});

module.exports = router; // ТОВА Е НАЙ-ВАЖНИЯТ РЕД