import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiZap, FiMic, FiCheckCircle, FiAward, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Default values in case accessed directly
    const { 
        score = 71, 
        wpm = 118, 
        pronunciationScore = 75, 
        totalScore = 71, 
        correctAnswers = 2, 
        totalQuestions = 3,
        feedback = "Good effort! You have a solid foundation but there's room for improvement. You got 2 out of 3 questions correct. Try to read more carefully to catch all the details. Work on improving your reading speed through regular practice, but don't sacrifice comprehension for speed. Your pronunciation is generally good. Focus on clarity and proper enunciation."
    } = location.state || {};

    return (
        <div className="min-h-screen bg-[#f7f9fb] p-8 font-sans">
            <div className="max-w-4xl mx-auto text-center">
                {/* Header Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
                        <FiAward />
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold text-slate-800 mb-1">Test Results</h1>
                <p className="text-orange-500 font-semibold text-lg mb-8">Good Job! 👍</p>

                {/* Success Banner */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-8 flex items-center justify-center gap-3 text-green-700">
                    <FiCheckCircle className="w-6 h-6" />
                    <span className="font-medium">Congratulations! You scored {Math.round(totalScore)}% and have unlocked the next level! 🎉</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Reading Speed */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                                <FiZap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Reading Speed</h3>
                                <p className="text-slate-500 text-sm">Words per minute</p>
                            </div>
                        </div>
                        <div className="mb-2">
                            <span className="text-2xl font-bold text-slate-800">{Math.round(wpm)} WPM</span>
                        </div>
                         <div className="w-full h-2 bg-blue-100 rounded-full mb-2">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((wpm / 200) * 100, 100)}%` }}></div>
                        </div>
                         <p className="text-slate-500 text-sm">Practice to improve speed!</p>
                    </div>

                    {/* Pronunciation */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left">
                        <div className="flex items-start gap-4 mb-4">
                             <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                                <FiMic className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Pronunciation</h3>
                                <p className="text-slate-500 text-sm">Clarity score</p>
                            </div>
                        </div>
                        <div className="mb-2">
                            <span className="text-2xl font-bold text-slate-800">{Math.round(pronunciationScore)}%</span>
                        </div>
                        <div className="w-full h-2 bg-purple-100 rounded-full mb-2">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pronunciationScore}%` }}></div>
                        </div>
                        <p className="text-slate-500 text-sm">Good pronunciation!</p>
                    </div>

                    {/* Quiz Score */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left">
                        <div className="flex items-start gap-4 mb-4">
                             <div className="p-3 bg-green-50 text-green-500 rounded-xl">
                                <FiCheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Quiz Score</h3>
                                <p className="text-slate-500 text-sm">Comprehension accuracy</p>
                            </div>
                        </div>
                        <div className="mb-2">
                            <span className="text-2xl font-bold text-slate-800">{correctAnswers} / {totalQuestions} correct</span>
                        </div>
                        <div className="w-full h-2 bg-green-100 rounded-full mb-2">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${(correctAnswers / totalQuestions) * 100}%` }}></div>
                        </div>
                        <p className="text-slate-500 text-sm">Well done!</p>
                    </div>

                    {/* Total Score */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left">
                        <div className="flex items-start gap-4 mb-4">
                             <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                                <FiAward className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Total Score</h3>
                                <p className="text-slate-500 text-sm">Overall performance</p>
                            </div>
                        </div>
                        <div className="mb-2">
                            <span className="text-2xl font-bold text-orange-500">{Math.round(totalScore)}%</span>
                        </div>
                        <div className="w-full h-2 bg-orange-100 rounded-full mb-2">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${totalScore}%` }}></div>
                        </div>
                        <p className="text-slate-500 text-sm">Average of pronunciation and quiz scores</p>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-left mb-8 flex gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-xl h-fit">
                         <FiMessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">Personalized Feedback</h3>
                         <p className="text-blue-500 font-medium mb-3">Based on your performance</p>
                         <p className="text-slate-700 leading-relaxed">
                            {feedback}
                         </p>
                    </div>
                </div>

                {/* Back Button */}
                <button 
                    onClick={() => navigate('/levelsPage')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <FiArrowLeft className="w-5 h-5" />
                    Back to Levels
                </button>
            </div>
        </div>
    );
};

export default ResultPage;
