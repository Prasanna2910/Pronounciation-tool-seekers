import Test from "../model/test.js";
import User from "../model/user.js";



const createTest = async (req, res) => {
    const { para, questions, level } = req.body;
    try {
        await Test.create({ para, questions, level });
        res.status(201).json({ message: "created the test" });
    } catch (err) {
        res.status(500).json({ message: "Error creating test", error: err.message });
    }
};
const bulkTestAdding = async (req, res) => {
    const { tests } = req.body;
    try {
        await Test.insertMany(tests);
        res.status(201).json({ message: "created the tests" });
    } catch (err) {
        res.status(500).json({ message: "Error creating tests", error: err.message });
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
    const { id, level, user_id } = req.params;
    try {
        const test = await Test.findOne({ date: id, level: level });
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        
        const taken = test.taken.includes(user_id);
        if (taken) {
            return res.status(400).json({ message: 'Test already taken' });
        }

        const user = await User.findById(user_id);
        if (user && user.tests && user.tests.length > 0) {
            const lastTest = user.tests[user.tests.length - 1];
            const lastTestDate = new Date(lastTest.date).setHours(0,0,0,0);
            const today = new Date().setHours(0,0,0,0);
            
            if (lastTestDate === today) {
                return res.status(403).json({ message: 'Daily limit reached. Come back tomorrow!' });
            }
        }

        res.status(200).json({ test });
    } catch (err) {
        res.status(500).json({ message: "Error fetching test", error: err.message });
    }
};

const getRandomTest = async (req, res) => {
    const { level, user_id } = req.params;
    try {
        const count = await Test.countDocuments({ 
            level: level, 
            taken: { $ne: user_id } 
        });
        if (count === 0) {
            return res.status(404).json({ message: 'No more tests available for this level! Great job!' });
        }

        const random = Math.floor(Math.random() * count);

        const test = await Test.findOne({ 
            level: level, 
            taken: { $ne: user_id } 
        }).skip(random);

        if (!test) {
             return res.status(404).json({ message: 'Error finding test' });
        }

        res.status(200).json({ test });

    } catch (err) {
        res.status(500).json({ message: "Error fetching random test", error: err.message });
    }
};

const submitResult = async (req, res) => {
    const { id } = req.params;
    const { result, user_id } = req.body;
        
    try {
        await User.findByIdAndUpdate(user_id, { $push: { tests: result } });
        await Test.findByIdAndUpdate(id, { $push: { results: result, taken: user_id } });

        const updatedUser = await User.findById(user_id);
        const currentLevel = updatedUser.level || 1;
        const testsInLevel = updatedUser.tests.filter(t => t.level == currentLevel).length;
        if(testsInLevel<=15 && result.score>=50){
            await User.findByIdAndUpdate(user_id, { 
                $set: { end_level_day: testsInLevel + 30}
            });
            return res.status(200).json({ message: "Results submitted. Level Up!", levelUp: true });
        }
        if (testsInLevel >= updatedUser.end_level_day){
            await User.findByIdAndUpdate(user_id, { 
                $set: { level: currentLevel + 1 }
            });
            return res.status(200).json({ message: "Results submitted. Level Up!", levelUp: true });
        }

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
export default { createTest, getAllTests, getTestById, getRandomTest, submitResult, updateTest, deleteTest,bulkTestAdding };