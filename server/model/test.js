import mongoose from "mongoose";

const schema = new mongoose.Schema({
    para: String,
    questions: Array,
    date: String,
    level: String,
    results: Array,
    taken: Array,
});

const model = mongoose.model("test", schema);

export default model;