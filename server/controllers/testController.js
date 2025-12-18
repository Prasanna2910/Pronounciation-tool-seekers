import Test from "../model/test.js";
import User from "../model/user.js";
import user_test_day from "../utils/user.js";

const AGREGATE_SCORE=2

const createTest = async (req, res) => {
    const { para, questions, level, date } = req.body;
    try {
        const check = await Test.findOne({ date, level });
        if (check) {
            return res.status(500).json({ message: "Already exist" });
        }

        await Test.create({ para, questions, level, date });
        res.status(201).json({ message: "created the test" });
    } catch (err) {
        res.status(500).json({ message: "Error creating test", error: err.message });
    }
};

const getAllTests = async (req, res) => {
    try {
        const tests = await Test.find({});
        res.json(tests);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tests", error: err.message });
    }
};

const getTestById = async (req, res) => {
    const { id, level,user_id } = req.params;
    try {
        const test = await Test.findOne({ date: id, level: level });
        if(!test){
            return res.status(404).json({ message: 'Test not found' });
        }
        const taken = test.taken.includes(user_id);
        if(taken){
            return res.status(400).json({ message: 'Test already taken' });
        }
        res.status(200).json({test});
    } catch (err) {
        res.status(500).json({ message: "Error fetching test", error: err.message });
    }
};

const submitResult = async (req, res) => {
    const { id } = req.params;
    const { result, user_id } = req.body;
    const user_data=await User.findById(user_id)
    const level_test_day=user_test_day.user_test_day(user_data)+1
    try {
        if (result.marks >=AGREGATE_SCORE && level_test_day<15 && user_data.end_level_day==45){
            await User.findByIdAndUpdate(user_id, { $push: { tests: result },end_level_day:level_test_day+30 });
            await Test.findByIdAndUpdate(id, { $push: { results: result,taken:user_id } });
           return res.status(200).json({ message: "Results submitted" });
        }
        if(level_test_day==user_data.end_level_day){
            await User.findByIdAndUpdate(user_id, { $push: { tests: result },level:user_data.level+1,end_level_day:45 });
            await Test.findByIdAndUpdate(id, { $push: { results: result,taken:user_id } });
           return res.status(200).json({ message: "Results submitted" });
        }
        await User.findByIdAndUpdate(user_id, { $push: { tests: result } });
        await Test.findByIdAndUpdate(id, { $push: { results: result,taken:user_id } });
        return res.status(200).json({ message: "Results submitted" });
    } catch (err) {
        return res.status(500).json({
            message: "Error submitting results",
            error: err.message
        });
    }
};

const updateTest = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedTest = await Test.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedTest) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json({ message: 'Test updated', test: updatedTest });
    } catch (err) {
        res.status(500).json({ message: 'Error updating test', error: err.message });
    }
};

const deleteTest = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Test.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json({ message: 'Test deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting test', error: err.message });
    }
};
export default { createTest, getAllTests, getTestById, submitResult, updateTest, deleteTest };