const mongoose = require("mongoose");
const signupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true  
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: { 
        type: String,
    },
    tests: {
        type: Array,
        default: []
    },
    level: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model("user", signupSchema);