import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FiAward,
    FiZap,
    FiMic,
    FiCheckCircle,
    FiBarChart2,
    FiArrowLeft,
    FiTrendingUp
} from "react-icons/fi";

const ResultPage = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state || {};

    // Extract backend values safely
    const pronunciation = state.pronunciation_score || 0;
    const fluency = state.fluency_score || 0;
    const proficiency = state.proficiency_score || 0;
    const quizScore = state.quizScore || 0;

    const correctAnswers = state.correctAnswers || 0;
    const totalQuestions = state.totalQuestions || 0;

    const wpm = state.wpm || 0;
    const accuracy = state.accuracy || 0;

    const pronunciationData = state.pronunciation || {};
    const readingData = state.reading || {};
    const overallData = state.overall || {};

    // FINAL TOTAL SCORE CALCULATION
    // Prefer backend overall score
    const totalScore = overallData.overall_score
        ? Math.round(overallData.overall_score)
        : Math.round(
            pronunciation * 0.4 +
            fluency * 0.2 +
            quizScore * 0.3 +
            accuracy * 0.1
        );

    // Performance rating
    const getRating = (score) => {
        if (score >= 90) return { text: "Outstanding", color: "text-green-600" };
        if (score >= 75) return { text: "Excellent", color: "text-blue-600" };
        if (score >= 60) return { text: "Good", color: "text-orange-500" };
        if (score >= 40) return { text: "Average", color: "text-yellow-500" };
        return { text: "Needs Improvement", color: "text-red-500" };
    };

    const rating = getRating(totalScore);

    const ScoreCard = ({ title, value, icon, color, subtitle }) => (

        <div className="bg-white p-6 rounded-2xl shadow-sm border">

            <div className="flex items-center gap-4 mb-4">

                <div className={`p-3 rounded-xl ${color}`}>
                    {icon}
                </div>

                <div>
                    <h3 className="font-bold text-gray-800">
                        {title}
                    </h3>

                    <p className="text-sm text-gray-500">
                        {subtitle}
                    </p>
                </div>

            </div>

            <div className="text-3xl font-bold text-gray-800">
                {value}
            </div>

            <div className="w-full bg-gray-100 h-2 rounded-full mt-3">

                <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                />

            </div>

        </div>

    );

    const WordAnalysis = ({ words }) => {
        if (!words || words.length === 0) return null;

        return (
            <div className="bg-white p-8 rounded-3xl shadow-lg mb-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <FiMic size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Speech Analysis</h2>
                </div>

                <div className="flex flex-wrap gap-2 leading-relaxed text-lg">
                    {words.map((word, index) => {
                        const score = word.word_score || 0;
                        let colorClass = "bg-gray-100 text-gray-800"; // Default

                        if (score >= 80) colorClass = "bg-green-100 text-green-700 border-green-200";
                        else if (score >= 50) colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
                        else colorClass = "bg-red-50 text-red-700 border-red-200";

                        return (
                            <span
                                key={index}
                                className={`px-2 py-1 rounded-lg border ${colorClass} transition-all hover:scale-105 cursor-default relative group`}
                            >
                                {word.word_text}
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    Score: {score}
                                </span>
                            </span>
                        );
                    })}
                </div>

                <div className="mt-6 flex gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Excellent (80-100)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Good (50-79)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Needs Improvement (&lt;50)</span>
                    </div>
                </div>
            </div>
        );
    };

    return (

        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-5xl mx-auto">

                {/* Header */}

                <div className="text-center mb-8">

                    <div className="flex justify-center mb-4">

                        <div className="bg-indigo-600 text-white p-5 rounded-full shadow-lg">
                            <FiAward size={32} />
                        </div>

                    </div>

                    <h1 className="text-3xl font-bold">
                        Test Results
                    </h1>

                    <p className={`text-xl font-semibold mt-2 ${rating.color}`}>
                        {rating.text}
                    </p>

                </div>


                {/* Total Score Big Card */}

                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-3xl mb-8 shadow-lg">

                    <div className="flex justify-between items-center">

                        <div>

                            <h2 className="text-lg opacity-90">
                                Total Score
                            </h2>

                            <div className="text-5xl font-bold mt-2">
                                {totalScore}%
                            </div>

                            <p className="opacity-80 mt-2">
                                Combined performance score
                            </p>

                        </div>

                        <FiTrendingUp size={60} />

                    </div>

                </div>


                {/* Score Grid */}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                    <ScoreCard
                        title="Pronunciation"
                        value={Math.round(pronunciation)}
                        subtitle="Speech clarity"
                        icon={<FiMic size={24} />}
                        color="bg-purple-500 text-white"
                    />

                    <ScoreCard
                        title="Fluency"
                        value={Math.round(fluency)}
                        subtitle="Speech flow"
                        icon={<FiBarChart2 size={24} />}
                        color="bg-blue-500 text-white"
                    />

                    <ScoreCard
                        title="Quiz Score"
                        value={Math.round(quizScore)}
                        subtitle={`${correctAnswers}/${totalQuestions} correct`}
                        icon={<FiCheckCircle size={24} />}
                        color="bg-green-500 text-white"
                    />

                    <ScoreCard
                        title="Reading Speed"
                        value={Math.round(wpm)}
                        subtitle="Words per minute"
                        icon={<FiZap size={24} />}
                        color="bg-yellow-500 text-white"
                    />

                    <ScoreCard
                        title="Accuracy"
                        value={accuracy}
                        subtitle="Correct word accuracy"
                        icon={<FiAward size={24} />}
                        color="bg-orange-500 text-white"
                    />

                    <ScoreCard
                        title="Proficiency"
                        value={Math.round(proficiency)}
                        subtitle="Overall English level"
                        icon={<FiTrendingUp size={24} />}
                        color="bg-indigo-500 text-white"
                    />

                </div>

                {/* Speech Analysis Section */}
                {pronunciationData.words && (
                    <WordAnalysis words={pronunciationData.words} />
                )}

                {/* Performance Breakdown */}

                <div className="bg-white p-6 rounded-2xl shadow mb-8">

                    <h3 className="font-bold text-lg mb-4">
                        Score Breakdown
                    </h3>

                    <div className="space-y-3 text-gray-700">

                        <div>
                            Pronunciation: {Math.round(pronunciation)} × 40%
                        </div>

                        <div>
                            Fluency: {Math.round(fluency)} × 20%
                        </div>

                        <div>
                            Quiz Score: {Math.round(quizScore)} × 30%
                        </div>

                        <div>
                            Accuracy: {accuracy} × 10%
                        </div>

                        <div className="font-bold text-indigo-600 mt-4">
                            Final Score: {totalScore}%
                        </div>

                    </div>

                </div>


                {/* Back Button */}

                <button

                    onClick={() => navigate("/levelsPage")}

                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"

                >

                    <FiArrowLeft />

                    Back to Levels

                </button>

            </div>

        </div>

    );

};

export default ResultPage;