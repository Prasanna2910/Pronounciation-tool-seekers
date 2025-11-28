const Test=require("../model/test")
const express = require("express");
const route = express.Router();
const User = require("../model/user");

route.post("/",async (req,res)=>{
    const {para,questions,level,date}=req.body
    const check=await Test.findOne({date,level})
    if(check){
        res.status(500).json({message:"Already exist"})
    }
    await Test.create({para,questions,level,date})
    res.status(201).json({message:"created the test"})
})
route.get("/",async (req,res)=>{
    const tests=await Test.find({})
    res.json(tests)
})
route.get("/:id/:level",async(req,res)=>{
    const {id,level}=req.params
    const test=await Test.findOne({date:id,level:level})
    res.status(200).json(test)
})
route.post("/submit/:id",(req,res)=>{
    const {id}=req.params
    const {result,user_id}=req.body
    User.findByIdAndUpdate(user_id,{ $push:{tests:result} }).then(()=>{
    })
    Test.findByIdAndUpdate(id,{$push: { results: result }}).then(()=>{
        res.status(200).json({message:"Results submitted"})
    }).catch((err)=>{
        res.status(500).json({
            message:"Error submitting results",
            error: err.message
        })
    })
})

route.put('/test/:id', async (req, res) => {
    try {
        const { id } = req.params
        const updates = req.body
        const updatedTest = await Test.findByIdAndUpdate(id, updates, { new: true })
        if (!updatedTest) {
            return res.status(404).json({ message: 'Test not found' })
        }
        res.status(200).json({ message: 'Test updated', test: updatedTest })
    } catch (err) {
        res.status(500).json({ message: 'Error updating test', error: err.message })
    }
})

route.delete('/test/:id', async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await Test.findByIdAndDelete(id)
        if (!deleted) {
            return res.status(404).json({ message: 'Test not found' })
        }
        res.status(200).json({ message: 'Test deleted' })
    } catch (err) {
        res.status(500).json({ message: 'Error deleting test', error: err.message })
    }
})

module.exports = route