const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const PORT = dotenv.PORT || 5000;

app.get("/",(req,res)=>{
    res.send("Seekers educational app is running")
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})