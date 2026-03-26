const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendAccountEmail(to, subject, html) {
    await transporter.sendMail({
        from: `"MedGuide" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
}

router.post("/signup", async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            emergencyFirstName,
            emergencyLastName,
            emergencyEmail
        } = req.body;

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !emergencyFirstName ||
            !emergencyLastName ||
            !emergencyEmail
        ) {
            return res.status(400).json({
                success: false,
                message: "Всички полета са задължителни."
            });
        }

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Потребител с този email вече съществува."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            emergencyFirstName,
            emergencyLastName,
            emergencyEmail
        });

        await sendAccountEmail(
            email,
            "Успешна регистрация в MedGuide",
            `
            <h2>Добре дошъл/дошла в MedGuide, ${firstName}!</h2>
            <p>Регистрацията ти беше успешна.</p>
            <p>Вече можеш да използваш платформата.</p>
            `
        );

        return res.status(201).json({
            success: true,
            message: "Регистрацията е успешна.",
            user: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Грешка при регистрация."
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email и парола са задължителни."
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Няма такъв потребител."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Невалидна парола."
            });
        }

        await sendAccountEmail(
            user.email,
            "Успешен вход в MedGuide",
            `
            <h2>Здравей, ${user.firstName}!</h2>
            <p>Успешно влезе в профила си в MedGuide.</p>
            <p>Ако това не си бил/а ти, смени паролата си.</p>
            `
        );

        return res.status(200).json({
            success: true,
            message: "Входът е успешен.",
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Грешка при вход."
        });
    }
});

module.exports = router;