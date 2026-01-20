import axios from "axios";
import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiLayers, FiFileText } from "react-icons/fi";

function LevelsManagement() {
    const [tests, setTests] = useState([]);
    const [curr, setCurr] = useState(1);
    const [showUpload, setShowUpload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newTest, setNewTest] = useState({
        level: 1,
        para: "",
        questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]
    });

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("https://pronounciation-tool-seekers.onrender.com/test/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTests(res.data);
        } catch (err) {
            console.error("Error fetching tests:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLevelChange = (e) => {
        setNewTest({ ...newTest, level: e.target.value });
    };

    const handleParaChange = (e) => {
        setNewTest({ ...newTest, para: e.target.value });
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...newTest.questions];
        updatedQuestions[index][field] = value;
        setNewTest({ ...newTest, questions: updatedQuestions });
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updatedQuestions = [...newTest.questions];
        updatedQuestions[qIndex].options[oIndex] = value;
        setNewTest({ ...newTest, questions: updatedQuestions });
    };

    const addQuestion = () => {
        setNewTest({
            ...newTest,
            questions: [...newTest.questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]
        });
    };

    const removeQuestion = (index) => {
        const updatedQuestions = newTest.questions.filter((_, i) => i !== index);
        setNewTest({ ...newTest, questions: updatedQuestions });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this test?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://pronounciation-tool-seekers.onrender.com/test/test/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Test deleted successfully");
            fetchTests();
        } catch (err) {
            console.error("Error deleting test:", err);
            alert("Failed to delete test");
        }
    };

    const handleEdit = (test) => {
        setNewTest({
            _id: test._id,
            level: test.level,
            para: test.para,
            questions: test.questions
        });
        setShowUpload(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (newTest._id) {
                await axios.put(`https://pronounciation-tool-seekers.onrender.com/test/test/${newTest._id}`, newTest, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Test updated successfully!");
            } else {
                await axios.post("https://pronounciation-tool-seekers.onrender.com/test", newTest, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Test created successfully!");
            }
            setShowUpload(false);
            setNewTest({
                level: 1,
                para: "",
                questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]
            });
            fetchTests();
        } catch (err) {
            console.error("Error saving test:", err);
            alert("Failed to save test");
        }
    };

    if (loading) {
        return (
            <div className="p-8 font-sans min-h-screen bg-[#f8fafc]">
                <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-8"></div>
                <div className="h-12 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
                <div className="flex gap-4 mb-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 font-sans bg-[#f8fafc] min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-heading">
                            Levels <span className="text-gradient">Management</span>
                        </h1>
                        <p className="text-gray-500 mt-1">Create, update, and manage reading tests</p>
                    </div>
                    <button
                        onClick={() => {
                            setNewTest({
                                level: 1,
                                para: "",
                                questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]
                            });
                            setShowUpload(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 flex items-center gap-2 font-medium"
                    >
                        <FiPlus className="text-lg" /> Upload New Test
                    </button>
                </div>

                {showUpload && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                <h2 className="text-2xl font-bold font-heading text-gray-800">{newTest._id ? 'Edit Test' : 'Add New Test'}</h2>
                                <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                    <FiX className="text-xl" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">Level Select</label>
                                    <div className="relative">
                                        <select
                                            value={newTest.level}
                                            onChange={handleLevelChange}
                                            className="w-full border border-gray-300 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all appearance-none"
                                        >
                                            <option value={1}>Level 1 (Beginner)</option>
                                            <option value={2}>Level 2 (Expert)</option>
                                            <option value={3}>Level 3 (Pro)</option>
                                            <option value={4}>Level 4 (Master)</option>
                                        </select>
                                        <FiLayers className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">Reading Paragraph</label>
                                    <textarea
                                        value={newTest.para}
                                        onChange={handleParaChange}
                                        className="w-full border border-gray-300 p-4 rounded-xl h-40 bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all resize-y font-mono text-sm leading-relaxed"
                                        placeholder="Enter the reading passage here..."
                                        required
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                            <FiFileText className="text-indigo-500" /> Questions
                                        </h3>
                                        <button type="button" onClick={addQuestion} className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
                                            + Add Question
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {newTest.questions.map((q, qIndex) => (
                                            <div key={qIndex} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative group">
                                                <div className="flex justify-between mb-3">
                                                    <label className="font-semibold text-gray-700">Question {qIndex + 1}</label>
                                                    {newTest.questions.length > 1 && (
                                                        <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors">Remove</button>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={q.question}
                                                    onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                                                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
                                                    placeholder="Enter the question"
                                                    required
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt, oIndex) => (
                                                        <div key={oIndex} className="flex gap-2 items-center group/option">
                                                            <div className="relative">
                                                                <input
                                                                    type="radio"
                                                                    name={`correct-${qIndex}`}
                                                                    checked={q.correctAnswer === oIndex}
                                                                    onChange={() => handleQuestionChange(qIndex, "correctAnswer", oIndex)}
                                                                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                                />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                                className={`w-full border p-2.5 rounded-lg text-sm transition-all outline-none ${q.correctAnswer === oIndex ? 'border-green-500 bg-green-50' : 'border-gray-300 focus:border-indigo-500'}`}
                                                                placeholder={`Option ${oIndex + 1}`}
                                                                required
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowUpload(false)}
                                        className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transform transition-all active:scale-95">
                                        {newTest._id ? 'Update Test' : 'Save Test'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl border border-gray-200 w-fit">
                    {["1", "2", "3", "4"].map(level => (
                        <button
                            key={level}
                            onClick={() => setCurr(level)}
                            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${curr === level
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            Level {level}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                    {tests.filter((test) => test.level === curr).map((test) => (
                        <div key={test._id} className="glass bg-white/80 p-6 rounded-2xl shadow-sm border border-white/60 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${test.level == 1 ? 'bg-green-100 text-green-700' :
                                    test.level == 2 ? 'bg-blue-100 text-blue-700' :
                                        test.level == 3 ? 'bg-purple-100 text-purple-700' :
                                            'bg-amber-100 text-amber-700'
                                    }`}>
                                    Level {test.level}
                                </span>
                                <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                    ID: {test._id.slice(-6)}
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-800 text-lg mb-3 line-clamp-2 leading-tight min-h-[3.5rem]">
                                {test.para}
                            </h3>

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                <span className="flex items-center gap-1.5">
                                    <FiFileText className="text-gray-400" /> {test.para.split(' ').length} words
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <FiLayers className="text-gray-400" /> {test.questions.length} Qs
                                </span>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => handleEdit(test)}
                                    className="flex-1 bg-indigo-50 text-indigo-600 py-2.5 rounded-xl font-semibold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiEdit2 className="w-4 h-4" /> Update
                                </button>
                                <button
                                    onClick={() => handleDelete(test._id)}
                                    className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiTrash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {tests.filter((test) => test.level === curr).length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400">
                            <FiFileText className="mx-auto text-5xl mb-3 text-gray-200" />
                            <p>No tests found for this level.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LevelsManagement;
