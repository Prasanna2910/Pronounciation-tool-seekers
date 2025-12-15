const mongoose=require("mongoose")
const schema=new mongoose.Schema({
    para:String,
    questions:Array,
    date:String,
    level:String,
    results:Array
})
const model=mongoose.model("test",schema)
module.exports=model