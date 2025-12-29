import mongoose from "mongoose";

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
    },
    end_level_day:{
        type:Number,
        default:45
    }
});

export default mongoose.model("user", signupSchema);