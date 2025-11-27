const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const Signup = require("./models/Signup");
const cors = require("cors");
const route = require("./routes/route");

app.use(express.json());
app.use(cors());
app.use("/api",route);

console.log(route);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Connected to MongoDB");
})
.catch((err)=>{
    console.log("Error connecting to MongoDB: " , err.message);
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})