import React, { useState } from 'react';
import { FiBookOpen, FiLogOut, FiZap, FiAward, FiLock, FiBarChart2, FiCalendar } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import LevelCalendar from './LevelCalendar';
import { useNavigate } from "react-router-dom";
import ProgressDashboard from './ProgressDashboard'; 
import TestTakingPage from './testTakingPage';

// Placeholder helpers (replace with your actual data logic)
const getTeacherProgress = (user) => ({
	currentLevel: 'beginner',
	levelProgress: [
		{ level: 'beginner', completedDays: [1,2,3], tests: [
			{ day: 1, score: 85, readingSpeed: 120, date: '2024-01-01' },
			{ day: 2, score: 88, readingSpeed: 125, date: '2024-01-02' },
			{ day: 3, score: 90, readingSpeed: 130, date: '2024-01-03' },
		]},
		{ level: 'expert', completedDays: [], tests: [] },
		{ level: 'pro', completedDays: [], tests: [] },
		{ level: 'master', completedDays: [], tests: [] },
	]
});
const isLevelUnlocked = (user, level) => level === 'beginner';
const getNextDayNumber = (user, level) => 4;
const canTakeTestToday = (user, level) => true;

const levels = [
	{
		id: 'beginner',
		title: 'Beginner',
		description: 'Complete 30 daily tests to unlock the next level',
		icon: FiBookOpen,
		color: 'bg-green-500',
		hoverColor: 'hover:bg-green-600',
		order: 0,
	},
	{
		id: 'expert',
		title: 'Expert',
		description: 'Complete Beginner level to unlock',
		icon: FiZap,
		color: 'bg-blue-500',
		hoverColor: 'hover:bg-blue-600',
		order: 1,
	},
	{
		id: 'pro',
		title: 'Pro',
		description: 'Complete Expert level to unlock',
		icon: FiAward,
		color: 'bg-purple-400',
		hoverColor: 'hover:bg-purple-500',
		order: 2,
	},
	{
		id: 'master',
		title: 'Master',
		description: 'Complete Pro level to unlock',
		icon: FaCrown,
		color: 'bg-yellow-400',
		hoverColor: 'hover:bg-yellow-500',
		order: 3,
	},
];

function LevelsPage({ onLevelSelect, onLogout, onViewDashboard, currentUser }) {
	const [viewingCalendar, setViewingCalendar] = useState(null);
	const [viewingDashboard, setViewingDashboard] = useState(false);
	const [testingLevel, setTestingLevel] = useState(null); // Add this state
	const progress = getTeacherProgress(currentUser);
	const navigate = useNavigate();

	const handleViewDashboard = () => {
		setViewingDashboard(true);
	};

	const handleBackToLevels = () => {
		setViewingDashboard(false);
	};

	// If viewing dashboard, show dashboard
	if (viewingDashboard) {
		return (
			<ProgressDashboard
				onBackToLevels={handleBackToLevels}
				currentUser={currentUser}
			/>
		);
	}

	// If taking test, show test page
	if (testingLevel) {
		return (
			<TestTakingPage
				level={testingLevel.level}
				day={testingLevel.day}
				onBack={() => setTestingLevel(null)}
				onSubmitTest={(results) => {
					console.log('Test results:', results);
					// TODO: Handle test submission to backend
					// After submission, return to levels page
					setTestingLevel(null);
				}}
			/>
		);
	}

	const handleLevelClick = (level) => {
		const unlocked = isLevelUnlocked(currentUser, level);
		if (!unlocked) return;
		const canTakeToday = canTakeTestToday(currentUser, level);
		if (!canTakeToday) {
			alert("You have already completed today's test for this level. Please come back tomorrow!");
			return;
		}
		
		// Navigate to test page
		setTestingLevel({
			level: level,
			day: getNextDayNumber(currentUser, level)
		});
	};

	const getLevelProgress = (level) => {
		const levelProgress = progress.levelProgress.find(lp => lp.level === level);
		return levelProgress?.completedDays.length || 0;
	};

	const userProgressForCalendar = progress.levelProgress.reduce((acc, lp) => {
		acc[lp.level] = {
			current: getNextDayNumber(currentUser, lp.level),
			completed: lp.completedDays
		};
		return acc;
	}, {});

	return (
		<div className="min-h-screen bg-[#f7f9fb] p-8">
			<div className="max-w-6xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-[2rem] font-bold text-[#1a1a1a] mb-2">Choose Your Level</h1>
						<p className="text-[#6b7280] text-[1.1rem] font-normal">
							Complete one test per day. Each level requires 30 days to complete.
						</p>
					</div>
					<div className="flex gap-3">
						<button
							className="border border-[#e5e7eb] px-4 py-2 rounded-[0.5rem] bg-white text-[#1a1a1a] flex items-center gap-2 shadow-sm hover:bg-[#e0edff] hover:text-[#2563eb] text-[1rem] font-medium transition-colors"
							onClick={handleViewDashboard}
						>
							<FiBarChart2 className="w-5 h-5" />
							My Progress
						</button>
						<button
							className="border border-[#e5e7eb] px-4 py-2 rounded-[0.5rem] bg-white text-[#1a1a1a] flex items-center gap-2 shadow-sm hover:bg-[#fee2e2] hover:text-[#dc2626] text-[1rem] font-medium transition-colors"
							onClick={onLogout}
						>
							<FiLogOut className="w-5 h-5" />
							Logout
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{levels.map((level) => {
						const Icon = level.icon;
						const unlocked = isLevelUnlocked(currentUser, level.id);
						const completed = getLevelProgress(level.id);
						const isCompleted = completed >= 30;
						const canTakeToday = canTakeTestToday(currentUser, level.id);
						const nextDay = getNextDayNumber(currentUser, level.id);

						const iconBg = (() => {
							if (level.id === 'beginner') return unlocked ? 'bg-[#22c55e]' : 'bg-[#22c55e]/30';
							if (level.id === 'expert') return unlocked ? 'bg-[#3b82f6]' : 'bg-[#3b82f6]/30';
							if (level.id === 'pro') return unlocked ? 'bg-[#a78bfa]' : 'bg-[#a78bfa]/30';
							if (level.id === 'master') return unlocked ? 'bg-[#fbbf24]' : 'bg-[#fbbf24]/30';
							return 'bg-[#e5e7eb]';
						})();

						const progressBar = unlocked
							? level.id === 'beginner'
								? 'bg-[#22c55e]'
								: level.id === 'expert'
								? 'bg-[#3b82f6]'
								: level.id === 'pro'
								? 'bg-[#a78bfa]'
								: 'bg-[#fbbf24]'
							: 'bg-[#e5e7eb]';

						const mainBtn = unlocked
							? level.id === 'beginner'
								? 'bg-[#22c55e] hover:bg-[#16a34a]'
								: level.id === 'expert'
								? 'bg-[#3b82f6] hover:bg-[#2563eb]'
								: level.id === 'pro'
								? 'bg-[#a78bfa] hover:bg-[#8b5cf6]'
								: 'bg-[#fbbf24] hover:bg-[#f59e0b]'
							: 'bg-[#f3f4f6]';

						const calendarHover = unlocked
							? level.id === 'beginner'
								? 'hover:bg-[#ecfdf5]'
								: level.id === 'expert'
								? 'hover:bg-[#eff6ff]'
								: level.id === 'pro'
								? 'hover:bg-[#f3e8ff]'
								: 'hover:bg-[#fff7ed]'
							: 'hover:bg-[#f3f4f6]';

						return (
							<div
								key={level.id}
								className={`bg-white border border-[#e5e7eb] rounded-[1.25rem] p-7 transition-all transform will-change-transform flex flex-col gap-4 shadow-sm ${
									unlocked && canTakeToday
										? 'hover:shadow-lg hover:scale-[1.01] hover:-translate-y-1'
										: 'opacity-60'
								}`}
							>
								<div className="flex items-center gap-4">
									<div className={`rounded-[0.75rem] flex items-center justify-center w-12 h-12 ${iconBg}`}>
										{unlocked ? (
											<Icon className="w-6 h-6 text-white" />
										) : (
											<FiLock className="w-6 h-6 text-white" />
										)}
									</div>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-semibold text-[1.15rem] text-[#1a1a1a]">{level.title}</span>
											{!unlocked && (
												<span className="bg-[#f3f4f6] text-[#6b7280] px-2 py-1 rounded text-xs flex items-center gap-1 font-medium">
													<FiLock className="w-3 h-3" /> Locked
												</span>
											)}
										</div>
										<div className={`text-[#6b7280] text-[1rem] ${unlocked ? '' : 'font-medium'}`}>
											{level.description}
										</div>
									</div>
								</div>

								{unlocked && (
									<div className="mt-2">
										<div className="flex justify-between text-[0.95rem] mb-2 font-medium">
											<span className="text-[#6b7280]">Progress</span>
											<span className="text-[#1a1a1a]">{completed} / 30 days</span>
										</div>
										<div className="w-full bg-[#f3f4f6] rounded-full h-4">
											<div
												className={`rounded-full transition-all h-4 ${progressBar}`}
												style={{ width: `${(completed / 30) * 100}%` }}
											/>
										</div>
									</div>
								)}

								<div className="space-y-2 mt-2">
									{unlocked && (
										<>
											<button
												className={`w-full ${mainBtn} text-white py-2 rounded-[0.75rem] font-semibold text-[1.08rem] shadow-sm transition-all ${
													canTakeToday && !isCompleted ? '' : 'opacity-70 cursor-not-allowed'
												}`}
												disabled={!canTakeToday || isCompleted}
												onClick={() => handleLevelClick(level.id)}
											>
												{isCompleted
													? '🎉 Level Completed!'
													: !canTakeToday
													? "✓ Today's Test Done"
													: `Start Day ${nextDay} Test`}
											</button>
											<button
												className={`w-full border border-[#e5e7eb] py-2 rounded-[0.75rem] bg-white text-[#1a1a1a] flex items-center justify-center gap-2 shadow-sm text-[1.08rem] font-medium transition-colors ${calendarHover}`}
												onClick={() => setViewingCalendar(level.id)}
											>
												<FiCalendar className="w-5 h-5" />
												View Calendar
											</button>
										</>
									)}
									{!unlocked && (
										<button
											className="w-full py-2 rounded-[0.75rem] font-semibold text-[1.08rem] bg-[#f3f4f6] text-[#d1d5db] border border-[#e5e7eb]"
											disabled
										>
											<FiLock className="inline w-4 h-4 mr-1 align-middle" /> Locked
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>

				{progress.levelProgress.length > 0 && (
					<div className="mt-8 bg-gradient-to-r from-[#eef2ff] to-[#f3e8ff] border border-[#e5e7eb] rounded-[1.25rem] p-7">
						<h2 className="font-bold mb-2 text-[1.1rem] text-[#1a1a1a]">Your Journey</h2>
						<p className="text-[#374151] text-[1rem]">
							Current Level:{' '}
							<span className="font-semibold">
								{progress.currentLevel.charAt(0).toUpperCase() + progress.currentLevel.slice(1)}
							</span>
							<br />
							Total Days Completed:{' '}
							<span className="font-semibold">
								{progress.levelProgress.reduce((sum, lp) => sum + lp.completedDays.length, 0)}
							</span>
							<br />
							<span className="text-sm text-[#6b7280] mt-2 block">
								Remember: You can only take one test per day. Come back tomorrow for your next challenge!
							</span>
						</p>
					</div>
				)}
			</div>

			{viewingCalendar && (
				<LevelCalendar
					level={viewingCalendar}
					onClose={() => setViewingCalendar(null)}
					userProgress={userProgressForCalendar}
				/>
			)}
		</div>
	);
}

export default LevelsPage;