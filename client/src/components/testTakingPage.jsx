import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiMic, FiSquare, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

function TestTakingPage() {
	const location = useLocation();
	const { level, day } = location.state || {};

	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState({});
	const [audioBlob, setAudioBlob] = useState(null);
	const [loading, setLoading] = useState(true);
	const [testData, setTestData] = useState(null);
	const [testId, setTestId] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const mediaRecorderRef = useRef(null);
	const timerRef = useRef(null);

	const navigate = useNavigate();

	const onBackSafe = () => {
		navigate('/levelsPage');
	};

	useEffect(() => {
		if (level && day) {
			fetchTest();
		}
	}, [level, day]);

	const fetchTest = async () => {
		try {
			const token = localStorage.getItem('token');
			const userStr = localStorage.getItem('user');
			const user = JSON.parse(userStr);
			const res = await axios.get(`https://pronounciation-tool-seekers.onrender.com/test/random/${level}/${user._id}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setTestData(res.data.test);
			setTestId(res.data.test._id);
			setLoading(false);
		} catch (err) {
			console.error("Error fetching test:", err);
			if (err.response && err.response.status === 404) {
				alert(err.response.data.message || "No suitable test found.");
			} else {
				alert("Could not load test. Please try again or ensure it exists.");
			}
			onBackSafe();
		}
	};

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;

			const audioChunks = [];
			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				setAudioBlob(audioBlob);
				stream.getTracks().forEach(track => track.stop());
			};

			mediaRecorder.start();
			setIsRecording(true);

			timerRef.current = setInterval(() => {
				setRecordingTime(prev => prev + 1);
			}, 1000);
		} catch (error) {
			console.error('Error accessing microphone:', error);
			alert('Unable to access microphone. Please check your permissions.');
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			clearInterval(timerRef.current);
		}
	};

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const handleAnswerSelect = (questionId, optionIndex) => {
		setSelectedAnswers(prev => ({
			...prev,
			[questionId]: optionIndex
		}));
	};

	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
			if (mediaRecorderRef.current && isRecording) {
				mediaRecorderRef.current.stop();
			}
		};
	}, [isRecording]);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#f8fafc] p-8 flex items-center justify-center font-sans">
				<div className="text-center animate-fade-in">
					<div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
					<h2 className="text-2xl font-bold text-gray-800 font-heading">Preparing Your Test...</h2>
					<p className="text-gray-500">Get ready to show your skills!</p>
				</div>
			</div>
		);
	}

	const allQuestionsAnswered = testData.questions.every((q, index) =>
		selectedAnswers[index] !== undefined
	);

	const handleSubmit = async () => {

    if (!allQuestionsAnswered || !audioBlob) {
        alert("Please answer all questions and record audio.");
        return;
    }

    setSubmitting(true);

    try {

        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        // Prepare audio upload
        const formData = new FormData();

        formData.append("file", audioBlob, "recording.webm");
        formData.append("expected_text", testData.para);


        // Send to pronunciation API
        const analysisRes = await axios.post(
            "https://pronounciation-tool-seekers.onrender.com/get_result",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        const data = analysisRes.data;


        // ========================
        // EXTRACT SCORES SAFELY
        // ========================

        const pronunciation_score =
            Math.round(data.pronunciation?.overall_score || 0);

        const fluency_score =
            Math.round(data.fluency?.overall_score || 0);

        const proficiency_score =
            Math.round(data.overall?.overall_score || 0);


        const reading = data.reading || {};


        // FIXED WPM
        const wpm =
            Math.round(
                reading.speed_wpm_correct ??
                reading.speed_wpm ??
                0
            );


        // FIXED ACCURACY (convert decimal → %)
        const accuracy =
            reading.accuracy
                ? Math.round(reading.accuracy * 100)
                : 0;


        const completion =
            reading.completion || 0;

        const total_time =
            reading.total_time || 0;

        const correct_words =
            reading.correct_words_read || 0;

        const words_read =
            reading.words_read || 0;


        // ========================
        // QUIZ SCORE
        // ========================

        let correctCount = 0;

        testData.questions.forEach((q, idx) => {

            if (selectedAnswers[idx] === q.correctAnswer) {
                correctCount++;
            }

        });

        const quizScore = Math.round(
            (correctCount / testData.questions.length) * 100
        );


        // ========================
        // FINAL SCORE CALCULATION (FIXED)
        // ========================

        const finalScore = Math.round(

            pronunciation_score * 0.4 +
            fluency_score * 0.2 +
            quizScore * 0.3 +
            accuracy * 0.1

        );


        // ========================
        // FINAL RESULT OBJECT
        // ========================

        const results = {

            // Final Score
            score: finalScore,
            totalScore: finalScore,

            // Speaking Scores
            pronunciation_score,
            fluency_score,
            proficiency_score,

            // Quiz
            quizScore,
            correctAnswers: correctCount,
            totalQuestions: testData.questions.length,

            // Reading Metrics
            wpm,
            accuracy,
            completion,
            total_time,
            correct_words,
            words_read,

            // Meta
            level,
            day,
            user_id: user._id,
            date: new Date()

        };


        // ========================
        // SAVE RESULT
        // ========================

        await axios.post(
            `https://pronounciation-tool-seekers.onrender.com/test/submit/${testId}`,
            {
                result: results,
                user_id: user._id
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );


        // ========================
        // NAVIGATE TO RESULT PAGE
        // ========================

        navigate("/result", {
            state: results
        });


    }
    catch (err) {

        console.error("Error submitting test:", err);

        alert("Error submitting test. Please try again.");

        setSubmitting(false);

    }

};



	return (
		<div className="min-h-screen bg-[#f8fafc] p-6 pb-20 font-sans relative">
			{/* Background Blobs */}
			<div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
				<div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
				<div className="absolute top-40 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
			</div>

			<div className="max-w-4xl mx-auto relative z-10">
				{/* Header */}
				<div className="flex items-center justify-between mb-8 animate-slide-up">
					<button
						onClick={onBackSafe}
						className="glass hover:bg-white px-4 py-2 rounded-xl text-gray-700 flex items-center gap-2 transition-all hover:-translate-x-1"
					>
						<FiArrowLeft className="w-5 h-5" />
						<span className="font-medium">Exit Test</span>
					</button>

					<div className="flex items-center gap-4">
						<div className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200">
							Day {day} of 30
						</div>
						<div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border transition-all ${isRecording ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700'}`}>
							<FiClock className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
							<span className="font-mono font-bold text-lg w-12 text-center">{formatTime(recordingTime)}</span>
						</div>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="glass px-6 py-4 rounded-2xl mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
					<div className="flex justify-between text-sm mb-2 text-gray-500 font-medium">
						<span>Progress</span>
						<span>{Math.round((Object.keys(selectedAnswers).length / testData.questions.length) * 100)}% Completed</span>
					</div>
					<div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
							style={{ width: `${(Object.keys(selectedAnswers).length / testData.questions.length) * 100}%` }}
						/>
					</div>
				</div>

				{/* Reading Section */}
				<div className="bg-white rounded-[1.5rem] p-8 md:p-10 shadow-xl shadow-gray-100/50 mb-8 border border-white animate-slide-up" style={{ animationDelay: '200ms' }}>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 font-heading mb-1">
								Reading <span className="text-indigo-600">Challenge</span>
							</h1>
							<p className="text-sm text-gray-400 font-mono">Test ID: {testId}</p>
						</div>

						{!isRecording ? (
							<button
								onClick={startRecording}
								className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
							>
								<FiMic className="w-6 h-6" />
								Start Recording
							</button>
						) : (
							<button
								onClick={stopRecording}
								className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-red-200 transition-all hover:scale-105 active:scale-95 animate-pulse"
							>
								<FiSquare className="w-6 h-6 fill-current" />
								Stop Recording
							</button>
						)}
					</div>

					{/* Audio Playback */}
					{!isRecording && audioBlob && (
						<div className="mb-8 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-center gap-4 animate-fade-in">
							<div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
								<FiCheckCircle className="w-6 h-6" />
							</div>
							<div className="flex-1">
								<h3 className="font-bold text-indigo-900 mb-1">Recording Saved!</h3>
								<p className="text-sm text-indigo-700/70">Review your recording before submitting.</p>
							</div>
							<audio controls src={URL.createObjectURL(audioBlob)} className="w-full md:w-64 h-10 rounded-lg shadow-sm" />
						</div>
					)}

					<div className="prose prose-lg max-w-none prose-headings:font-heading prose-p:text-gray-700 prose-p:leading-loose">
						{testData.para.split('\n\n').map((paragraph, index) => (
							<p key={index} className="mb-6 last:mb-0">
								{paragraph}
							</p>
						))}
					</div>
				</div>

				{/* Questions Section */}
				<div className="space-y-6 mb-24 animate-slide-up" style={{ animationDelay: '300ms' }}>
					<div className="flex items-center gap-3 mb-4">
						<div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
						<h2 className="text-2xl font-bold text-gray-800 font-heading">Comprehension Questions</h2>
					</div>

					{testData.questions.map((question, qIndex) => (
						<div key={qIndex} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
							<div className="flex gap-4 mb-6">
								<span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
									{qIndex + 1}
								</span>
								<h3 className="text-lg font-semibold text-gray-800 pt-0.5">
									{question.question}
								</h3>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
								{question.options.map((option, optIndex) => (
									<button
										key={optIndex}
										onClick={() => handleAnswerSelect(qIndex, optIndex)}
										className={`text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 ${selectedAnswers[qIndex] === optIndex
											? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium shadow-sm'
											: 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white'
											}`}
									>
										{option}
									</button>
								))}
							</div>
						</div>
					))}
				</div>

				{/* Submit Footer */}
				<div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-200 p-6 z-50">
					<div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
						<div className="hidden md:flex flex-col">
							<span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</span>
							<div className="flex items-center gap-2">
								{allQuestionsAnswered ? (
									<span className="text-green-600 flex items-center gap-1 font-bold"><FiCheckCircle /> Questions Done</span>
								) : (
									<span className="text-orange-500 flex items-center gap-1 font-bold"><FiAlertCircle /> Questions Pending</span>
								)}
								<span className="text-gray-300">|</span>
								{audioBlob ? (
									<span className="text-green-600 flex items-center gap-1 font-bold"><FiCheckCircle /> Audio Recorded</span>
								) : (
									<span className="text-orange-500 flex items-center gap-1 font-bold"><FiAlertCircle /> Recording Needed</span>
								)}
							</div>
						</div>

						<button
							onClick={handleSubmit}
							disabled={!allQuestionsAnswered || !audioBlob || submitting}
							className={`flex-1 md:flex-none md:w-64 py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${allQuestionsAnswered && audioBlob && !submitting
								? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 hover:shadow-indigo-200 active:scale-95'
								: 'bg-gray-200 text-gray-400 cursor-not-allowed'
								}`}
						>
							{submitting ? (
								<>
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									Submitting...
								</>
							) : (
								<>
									Submit Test
									<FiCheckCircle className="w-5 h-5" />
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TestTakingPage;