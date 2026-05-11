const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET;

// ─── MIDDLEWARE ───
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

// ─── MONGODB CONNECTION ───
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

// ─── REGISTER ───
app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const exists = await User.findOne({ email });

        if (exists) {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        const hashed = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashed
        });

        await newUser.save();

        return res.status(201).json({
            message: "Registration successful! Please log in."
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

// ─── LOGIN ───
app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                email: user.email,
                name: user.name
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

// ─── PROTECTED ROUTE ───
app.get("/api/me", (req, res) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided."
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(token, JWT_SECRET);

        return res.json({
            user: decoded
        });

    } catch {

        return res.status(403).json({
            message: "Invalid or expired token."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});