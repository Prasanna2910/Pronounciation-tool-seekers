const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const Signup = require("./models/Signup");
const cors = require("cors");

const PORT = dotenv.PORT || 5000;

app.get("/",(req,res)=>{
    res.send("Seekers educational app is running")
})
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Connected to MongoDB");
})
.catch((err)=>{
    console.log("Error connecting to MongoDB: " , err.message);
});

app.post("/signup",(req,res)=>{
    const {name,email,password} = req.body;
    const newUser = new Signup({
        name,
        email,
        password
    });
    newUser.save().then(()=>{
        res.status(201).send("User signed up successfully");
    }).catch((err)=>{
        res.status(400).send("Error signing up user: " + err.message);
    });
})

app.get("/login",(req,res)=>{
    Signup.find()
    .then((users)=>{
        res.status(200).json(users);
    })
    .catch((err)=>{
        res.status(500).send("Error retrieving users: " , err.message);
    });
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})