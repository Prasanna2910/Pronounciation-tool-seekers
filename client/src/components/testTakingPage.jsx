import React, { useState, useRef, useEffect } from 'react';
import { FiArrowLeft, FiClock, FiMic, FiSquare } from 'react-icons/fi';

function TestTakingPage({ level, day, onBack, onSubmitTest }) {
	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState({});
	const [audioBlob, setAudioBlob] = useState(null);
	const mediaRecorderRef = useRef(null);
	const timerRef = useRef(null);

	// Mock test data - replace with actual data from backend
	const testData = {
		level: 'Beginner',
		day: 1,
		title: 'The Joy of Reading',
		passage: `Reading is one of the most valuable skills a person can develop. When we read, we open doors to new worlds, ideas, and perspectives. Books can take us to far-away places without leaving our homes. They can teach us about history, science, and countless other subjects.

Reading also improves our vocabulary and communication skills. The more we read, the more words we encounter and learn. This helps us express ourselves better in both writing and speaking. Additionally, reading exercises our brain, keeping it sharp and active.

Many successful people attribute their achievements to the habit of reading. By reading regularly, we can learn from the experiences of others and avoid making the same mistakes. Reading is truly a gift that keeps on giving throughout our lives.`,
		questions: [
			{
				id: 1,
				question: 'According to the passage, what is one main benefit discussed?',
				options: [
					'It provides entertainment only',
					'It opens doors to new worlds and ideas',
					'It is only useful for students',
					'It requires expensive equipment'
				],
				correctAnswer: 1
			},
			{
				id: 2,
				question: 'What does the passage suggest about regular practice?',
				options: [
					'It is not necessary',
					'It leads to improvement',
					'It should be avoided',
					'It is only for professionals'
				],
				correctAnswer: 1
			},
			{
				id: 3,
				question: 'What is the overall message of this passage?',
				options: [
					'The topic is too difficult',
					'The topic is important and beneficial',
					'The topic should be ignored',
					'The topic is outdated'
				],
				correctAnswer: 1
			}
		]
	};

	// Start recording audio
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
				const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
				setAudioBlob(audioBlob);
				stream.getTracks().forEach(track => track.stop());
			};

			mediaRecorder.start();
			setIsRecording(true);
			
			// Start timer
			timerRef.current = setInterval(() => {
				setRecordingTime(prev => prev + 1);
			}, 1000);
		} catch (error) {
			console.error('Error accessing microphone:', error);
			alert('Unable to access microphone. Please check your permissions.');
		}
	};

	// Stop recording audio
	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			clearInterval(timerRef.current);
		}
	};

	// Format time as MM:SS
	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	// Handle answer selection
	const handleAnswerSelect = (questionId, optionIndex) => {
		setSelectedAnswers(prev => ({
			...prev,
			[questionId]: optionIndex
		}));
	};

	// Check if all questions are answered
	const allQuestionsAnswered = testData.questions.every(q => 
		selectedAnswers[q.id] !== undefined
	);

	// Handle test submission
	const handleSubmit = () => {
		if (!allQuestionsAnswered) {
			return;
		}

		// Calculate score
		let correctCount = 0;
		testData.questions.forEach(q => {
			if (selectedAnswers[q.id] === q.correctAnswer) {
				correctCount++;
			}
		});

		const score = Math.round((correctCount / testData.questions.length) * 100);
		
		// Submit test results
		onSubmitTest({
			level,
			day,
			score,
			audioBlob,
			answers: selectedAnswers,
			recordingTime
		});
	};

	// Cleanup on unmount
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

	return (
		<div className="min-h-screen bg-[#f7f9fb] p-8">
			<div className="max-w-5xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<button 
						onClick={onBack}
						className="border border-[#e5e7eb] px-4 py-2 rounded-lg bg-white text-[#1a1a1a] flex items-center gap-2 shadow-sm hover:bg-gray-50 font-medium transition-colors"
					>
						<FiArrowLeft className="w-5 h-5" />
						Back
					</button>

					<div className="flex items-center gap-4">
						<div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold">
							Day {day} of 30
						</div>
						<div className="flex items-center gap-2 bg-white border border-[#e5e7eb] px-4 py-2 rounded-lg shadow-sm">
							<FiClock className="w-5 h-5 text-[#6b7280]" />
							<span className="font-semibold text-[#1a1a1a]">{formatTime(recordingTime)}</span>
						</div>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="w-full h-2 bg-gray-200 rounded-full mb-8">
					<div 
						className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
						style={{ width: `${(Object.keys(selectedAnswers).length / testData.questions.length) * 100}%` }}
					/>
				</div>

				{/* Main Content Card */}
				<div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 shadow-sm mb-6">
					{/* Title and Record Button */}
					<div className="flex items-center justify-between mb-6">
						<h1 className="text-2xl font-bold text-[#1a1a1a]">
							{testData.level} Level - {testData.title} - Day {testData.day}
						</h1>
						
						{!isRecording ? (
							<button
								onClick={startRecording}
								className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md transition-all"
							>
								<FiMic className="w-5 h-5" />
								Record Audio
							</button>
						) : (
							<button
								onClick={stopRecording}
								className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md transition-all animate-pulse"
							>
								<FiSquare className="w-5 h-5" />
								Stop Recording
							</button>
						)}
					</div>

					{/* Passage */}
					<div className="prose max-w-none mb-8">
						{testData.passage.split('\n\n').map((paragraph, index) => (
							<p key={index} className="text-[#1a1a1a] text-[1.05rem] leading-relaxed mb-4">
								{paragraph}
							</p>
						))}
					</div>
				</div>

				{/* Questions Section */}
				<div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 shadow-sm mb-6">
					<h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Comprehension Questions</h2>
					<p className="text-[#6b7280] text-[1rem] mb-6">Read the passage above and answer the following questions</p>

					<div className="space-y-8">
						{testData.questions.map((question, qIndex) => (
							<div key={question.id}>
								<div className="flex items-start gap-3 mb-4">
									<div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">
										{qIndex + 1}
									</div>
									<p className="font-semibold text-[#1a1a1a] text-[1.05rem] pt-1">
										{question.question}
									</p>
								</div>

								<div className="ml-11 space-y-3">
									{question.options.map((option, optIndex) => (
										<button
											key={optIndex}
											onClick={() => handleAnswerSelect(question.id, optIndex)}
											className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
												selectedAnswers[question.id] === optIndex
													? 'border-indigo-600 bg-indigo-50 text-indigo-900'
													: 'border-[#e5e7eb] bg-white text-[#1a1a1a] hover:border-indigo-300 hover:bg-indigo-50'
											}`}
										>
											{option}
										</button>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Submit Button */}
				<div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-sm">
					<button
						onClick={handleSubmit}
						disabled={!allQuestionsAnswered}
						className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
							allQuestionsAnswered
								? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer'
								: 'bg-gray-200 text-gray-400 cursor-not-allowed'
						}`}
					>
						Submit Test
					</button>
					{!allQuestionsAnswered && (
						<p className="text-center text-[#6b7280] text-sm mt-3">
							Please answer all questions before submitting
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

export default TestTakingPage;