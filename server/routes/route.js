const express = require("express");
const route = express.Router();
const Signup = require("../models/Signup");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// SIGNUP ROUTE
route.post("/signup", (req, res) => {
    const { name, email, password } = req.body;

    const newUser = new Signup({ name, email, password });

    newUser.save()
    .then(savedUser => {
        const token = jwt.sign(
            { id: savedUser._id },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        return res.status(201).json({
            message: "User signed up successfully",
            token: token
        });
    })
    .catch(err => {
        return res.status(400).json({
            message: "Error signing up user",
            error: err.message
        });
    });
});


// LOGIN ROUTE
route.post("/login", (req, res) => {
    const { email, password } = req.body;

    Signup.findOne({ email, password })
    .then(user => {
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // After successful login, generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: user
        });
    })
    .catch(err => {
        return res.status(500).json({
            message: "Error retrieving user",
            error: err.message
        });
    });
});

module.exports = route;
