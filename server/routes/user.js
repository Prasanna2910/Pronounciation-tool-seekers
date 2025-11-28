const express = require("express");
const route = express.Router();
const user = require("../model/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

route.post("/signup", (req, res) => {
    const { name, email, password } = req.body;

    const newUser = new user({ name, email, password });

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


route.post("/login", (req, res) => {
    const { email, password } = req.body;

    user.findOne({ email, password })
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
route.post("/checkuser",async (req,res)=>{
    const {email}=req.body
    const check=await user.findOne({email})
    if(check){
        res.status(200).json({message:"User exists"})
    }
    else{
        res.json({message:"User does not exist"})
    }
})
route.post("/google",async (req,res)=>{
    const {email,name}=req.body
    const check=await user.findOne({email})
    if(check){
        const token = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );
        res.status(200).json({
            message: "Login successful",
            token: token,
            user: check
        })
    }
    const token = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );
       const userData= await user.create({email,name})
       res.status(200).json({
        message: "Login successful",
            token: token,
            user: userData
        })

})

module.exports = route;
