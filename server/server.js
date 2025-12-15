const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const route = require("./routes/user");

app.use(express.json());
app.use(cors());
app.use("/user",route);
app.use("/test",require("./routes/test"));

console.log(route);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO)
.then(()=>{
    console.log("Connected to MongoDB");
})
.catch((err)=>{
    console.log("Error connecting to MongoDB: " , err.message);
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})