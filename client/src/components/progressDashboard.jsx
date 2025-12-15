import React, { useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiAward, FiTrendingUp, FiZap } from 'react-icons/fi';

// Progress Dashboard Component
function ProgressDashboard({ onBackToLevels, currentUser }) {
	const [selectedLevel, setSelectedLevel] = useState(null);

	// Mock data - replace with actual data from your backend
	const progressData = {
		daysCompleted: 3,
		levelsCompleted: 0,
		averageScore: 0,
		averageReadingSpeed: 0,
		levelProgress: [
			{ level: 'beginner', completedDays: [1, 2, 3], tests: [
				{ day: 1, score: 85, readingSpeed: 120, date: '2024-01-01' },
				{ day: 2, score: 88, readingSpeed: 125, date: '2024-01-02' },
				{ day: 3, score: 90, readingSpeed: 130, date: '2024-01-03' },
			]},
			{ level: 'expert', completedDays: [], tests: [] },
			{ level: 'pro', completedDays: [], tests: [] },
			{ level: 'master', completedDays: [], tests: [] },
		]
	};

	const levels = [
		{ id: 'beginner', name: 'Beginner', color: 'bg-green-500', textColor: 'text-green-600', borderColor: 'border-green-500' },
		{ id: 'expert', name: 'Expert', color: 'bg-blue-500', textColor: 'text-blue-600', borderColor: 'border-blue-500' },
		{ id: 'pro', name: 'Pro', color: 'bg-purple-400', textColor: 'text-purple-600', borderColor: 'border-purple-400' },
		{ id: 'master', name: 'Master', color: 'bg-yellow-400', textColor: 'text-yellow-600', borderColor: 'border-yellow-400' }
	];

	const getLevelData = (levelId) => {
		return progressData.levelProgress.find(lp => lp.level === levelId);
	};

	const selectedLevelData = selectedLevel ? getLevelData(selectedLevel) : null;

	return (
		<div className="min-h-screen bg-[#f7f9fb] p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-[2rem] font-bold text-[#1a1a1a] mb-2">My Progress Dashboard</h1>
						<p className="text-[#6b7280] text-[1.1rem] font-normal">
							Track your improvement over time
						</p>
					</div>
					<button 
						className="border border-[#e5e7eb] px-4 py-2 rounded-[0.5rem] bg-white text-[#1a1a1a] flex items-center gap-2 shadow-sm hover:bg-gray-50 text-[1rem] font-medium transition-colors"
						onClick={onBackToLevels}
					>
						<FiArrowLeft className="w-5 h-5" />
						Back to Levels
					</button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					{/* Days Completed */}
					<div className="bg-white border border-[#e5e7eb] rounded-[1.25rem] p-6 shadow-sm">
						<div className="flex items-center justify-between mb-3">
							<span className="text-[#6b7280] text-[1rem] font-medium">Days Completed</span>
							<FiCheckCircle className="w-5 h-5 text-[#6b7280]" />
						</div>
						<div className="text-[2.5rem] font-bold text-[#1a1a1a] mb-1">
							{progressData.daysCompleted}
						</div>
						<p className="text-[#6b7280] text-[0.9rem]">Across all levels</p>
					</div>

					{/* Levels Completed */}
					<div className="bg-white border border-[#e5e7eb] rounded-[1.25rem] p-6 shadow-sm">
						<div className="flex items-center justify-between mb-3">
							<span className="text-[#6b7280] text-[1rem] font-medium">Levels Completed</span>
							<FiAward className="w-5 h-5 text-[#6b7280]" />
						</div>
						<div className="text-[2.5rem] font-bold text-[#1a1a1a] mb-1">
							{progressData.levelsCompleted} / 4
						</div>
						<p className="text-[#6b7280] text-[0.9rem]">Total milestones</p>
					</div>

					{/* Average Score */}
					<div className="bg-white border border-[#e5e7eb] rounded-[1.25rem] p-6 shadow-sm">
						<div className="flex items-center justify-between mb-3">
							<span className="text-[#6b7280] text-[1rem] font-medium">Average Score</span>
							<FiTrendingUp className="w-5 h-5 text-[#6b7280]" />
						</div>
						<div className="text-[2.5rem] font-bold text-[#ef4444] mb-1">
							{progressData.averageScore}%
						</div>
						<p className="text-[#6b7280] text-[0.9rem]">Overall performance</p>
					</div>

					{/* Avg Reading Speed */}
					<div className="bg-white border border-[#e5e7eb] rounded-[1.25rem] p-6 shadow-sm">
						<div className="flex items-center justify-between mb-3">
							<span className="text-[#6b7280] text-[1rem] font-medium">Avg Reading Speed</span>
							<FiZap className="w-5 h-5 text-[#6b7280]" />
						</div>
						<div className="text-[2.5rem] font-bold text-[#1a1a1a] mb-1">
							{progressData.averageReadingSpeed} WPM
						</div>
						<p className="text-[#6b7280] text-[0.9rem]">Words per minute</p>
					</div>
				</div>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Level Progress */}
					<div className="bg-white border border-[#e5e7eb] rounded-[1.25rem] p-7 shadow-sm">
						<h2 className="text-[1.3rem] font-bold text-[#1a1a1a] mb-2">Level Progress</h2>
						<p className="text-[#6b7280] text-[1rem] mb-6">Your journey through each level</p>

						{progressData.daysCompleted === 0 ? (
							<p className="text-[#6b7280] text-center py-12">
								No levels started yet. Begin your first test!
							</p>
						) : (
							<div className="space-y-4">
								{levels.map((level) => {
									const levelData = getLevelData(level.id);
									const completed = levelData?.completedDays.length || 0;
									const isActive = completed > 0;

									return (
										<button
											key={level.id}
											onClick={() => setSelectedLevel(level.id)}
											disabled={!isActive}
											className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
												selectedLevel === level.id
													? `${level.borderColor} bg-opacity-10`
													: 'border-[#e5e7eb] hover:border-gray-300'
											} ${!isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
										>
											<div className="flex items-center justify-between mb-2">
												<span className={`font-semibold text-[1.1rem] ${selectedLevel === level.id ? level.textColor : 'text-[#1a1a1a]'}`}>
													{level.name}
												</span>
												<span className="text-[#6b7280] text-[0.9rem]">
													{completed} / 30 days
												</span>
											</div>
											<div className="w-full bg-[#f3f4f6] rounded-full h-2.5">
												<div
													className={`h-full rounded-full transition-all ${level.color}`}
													style={{ width: `${(completed / 30) * 100}%` }}
												/>
											</div>
										</button>
									);
								})}
							</div>
						)}
					</div>

					{/* Recent Tests */}
					<div className="bg-white border border-[#e5e7eb] rounded-[1.25rem] p-7 shadow-sm">
						<h2 className="text-[1.3rem] font-bold text-[#1a1a1a] mb-2">Select a Level</h2>
						<p className="text-[#6b7280] text-[1rem] mb-6">Click on a level to view recent tests</p>

						{!selectedLevel ? (
							<div className="flex flex-col items-center justify-center py-16 text-center">
								<svg className="w-16 h-16 text-[#d1d5db] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
								</svg>
								<p className="text-[#6b7280]">
									Select a level from the left to view your daily progress
								</p>
							</div>
						) : selectedLevelData?.tests.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 text-center">
								<p className="text-[#6b7280]">No tests completed for this level yet.</p>
							</div>
						) : (
							<div className="space-y-3">
								{selectedLevelData?.tests.map((test) => {
									const levelInfo = levels.find(l => l.id === selectedLevel);
									return (
										<div
											key={test.day}
											className={`p-4 rounded-xl border-2 ${levelInfo.borderColor} bg-opacity-5`}
										>
											<div className="flex items-center justify-between mb-2">
												<span className="font-semibold text-[1.05rem] text-[#1a1a1a]">
													Day {test.day}
												</span>
												<span className="text-[#6b7280] text-[0.85rem]">
													{new Date(test.date).toLocaleDateString()}
												</span>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<p className="text-[0.85rem] text-[#6b7280] mb-1">Score</p>
													<p className={`text-[1.3rem] font-bold ${levelInfo.textColor}`}>
														{test.score}%
													</p>
												</div>
												<div>
													<p className="text-[0.85rem] text-[#6b7280] mb-1">Reading Speed</p>
													<p className={`text-[1.3rem] font-bold ${levelInfo.textColor}`}>
														{test.readingSpeed} WPM
													</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ProgressDashboard;