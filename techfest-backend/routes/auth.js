
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Cookie configuration
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 60 * 1000,
    path: "/"
};

// POST /api/auth/register
// Register a new user
router.post("/register", async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "All fields must be valid strings"
            });
        }

        if (!name.trim() || !email.trim() || !password) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        const exists = await User.findOne({
            email: email.trim()
        });

        if (exists) {
            return res.status(400).json({
                message: "Email already used"
            });
        }

        const hashed = await bcrypt.hash(password, 10);

        await User.create({
            name: name.trim(),
            email: email.trim(),
            password: hashed
        });

        res.status(201).json({
            message: "Registered successfully"
        });

    } catch (err) {
        next(err);
    }
});


// POST /api/auth/login
// Login an existing user
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Email and password must be valid strings"
            });
        }

        if (!email.trim() || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid login"
            });
        }

        const ok = await bcrypt.compare(password, user.password);

        if (!ok) {
            return res.status(401).json({
                message: "Invalid login"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        // Store JWT in an HTTP-only cookie
        res.cookie("token", token, cookieOptions);

        // Do not send JWT in response body
        res.json({
            message: "Login successful",
            name: user.name,
            role: user.role
        });

    } catch (err) {
        next(err);
    }
});


// POST /api/auth/logout
// Clear authentication cookie
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/"
    });

    res.json({
        message: "Logged out successfully"
    });
});


// GET /api/auth/me
// Get currently logged-in user
router.get("/me", auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
