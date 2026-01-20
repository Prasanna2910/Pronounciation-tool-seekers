import { FiBookOpen, FiLogOut, FiZap, FiAward, FiLock, FiBarChart2, FiCalendar } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import LevelCalendar from './LevelCalendar';
import { useNavigate } from "react-router-dom";
import ProgressDashboard from './ProgressDashboard';
import axios from 'axios';
import { useEffect, useState } from 'react';


function LevelsPage({ onLogout }) {
	const [viewingCalendar, setViewingCalendar] = useState(null);
	const [viewingDashboard, setViewingDashboard] = useState(false);
	const [testingLevel, setTestingLevel] = useState(null);
	const [currentUser, setCurrentUser] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetchUserProfile();
	}, []);

	const fetchUserProfile = async () => {
		try {
			const token = localStorage.getItem('token');
			const { data } = await axios.get('https://pronounciation-tool-seekers.onrender.com/user/profile', {
				headers: { Authorization: `Bearer ${token}` }
			});
			setCurrentUser(data);
			localStorage.setItem('user', JSON.stringify(data));
		} catch (err) {
			console.error('Error fetching profile:', err);
			if (err.response?.status === 401) {
				onLogout();
			}
		}
	};

	if (!currentUser) {
		return (
			<div className="min-h-screen bg-[#f8fafc] p-8 animate-fade-in">
				<div className="max-w-6xl mx-auto">
					<div className="flex justify-between items-center mb-8">
						<div>
							<div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-3"></div>
							<div className="h-6 w-96 bg-gray-200 rounded animate-pulse"></div>
						</div>
						<div className="flex gap-3">
							<div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
							<div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="bg-white rounded-[1.25rem] p-7 h-64 border border-gray-100 animate-pulse">
								<div className="flex gap-4 mb-6">
									<div className="w-12 h-12 bg-gray-200 rounded-[0.75rem]"></div>
									<div className="flex-1">
										<div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
										<div className="h-4 w-48 bg-gray-200 rounded"></div>
									</div>
								</div>
								<div className="space-y-3">
									<div className="h-12 w-full bg-gray-200 rounded-[0.75rem]"></div>
									<div className="h-10 w-full bg-gray-200 rounded-[0.75rem]"></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (viewingDashboard) {
		return <ProgressDashboard onBackToLevels={() => setViewingDashboard(false)} currentUser={currentUser} />;
	}

	const progress = {
		currentLevel: 1,
		levelProgress: [
			{ level: 1, completedDays: currentUser.tests?.filter(t => t.level == 1).map(t => t.day) || [], tests: currentUser.tests?.filter(t => t.level == 1) || [] },
			{ level: 2, completedDays: currentUser.tests?.filter(t => t.level == 2).map(t => t.day) || [], tests: currentUser.tests?.filter(t => t.level == 2) || [] },
			{ level: 3, completedDays: currentUser.tests?.filter(t => t.level == 3).map(t => t.day) || [], tests: currentUser.tests?.filter(t => t.level == 3) || [] },
			{ level: 4, completedDays: currentUser.tests?.filter(t => t.level == 4).map(t => t.day) || [], tests: currentUser.tests?.filter(t => t.level == 4) || [] },
		]
	};

	const isLevelUnlocked = (user, level) => {
		return (user.level || 1) >= level;
	};

	const getNextDayNumber = (user, level) => {
		const completedDays = user.tests?.filter(t => t.level == level).map(t => t.day) || [];
		return completedDays.length + 1;
	};

	const getLevelProgress = (levelId) => {
		const levelData = progress.levelProgress.find(p => p.level == levelId);
		return levelData ? levelData.completedDays.length : 0;
	};

	const canTakeTestToday = (user, level) => {
		if (!user.tests || user.tests.length === 0) return true;

		const lastTest = user.tests[user.tests.length - 1];
		const lastTestDate = new Date(lastTest.date).setHours(0, 0, 0, 0);
		const today = new Date().setHours(0, 0, 0, 0);

		return lastTestDate !== today;
	};

	const handleViewDashboard = () => {
		setViewingDashboard(true);
	};

	const handleLevelClick = (levelId) => {
		setTestingLevel(levelId);
		const day = getNextDayNumber(currentUser, levelId);
		navigate('/testTakingPage', { state: { level: levelId, day } });
	};

	const levels = [
		{ id: 1, title: 'Beginner', icon: FiBookOpen, description: 'Start your journey with simple texts.' },
		{ id: 2, title: 'Expert', icon: FiZap, description: 'Challenge yourself with complex vocabulary.' },
		{ id: 3, title: 'Pro', icon: FiAward, description: 'Master the language with advanced reading.' },
		{ id: 4, title: 'Master', icon: FaCrown, description: 'Achieve perfection in pronunciation.' },
	];

	const userProgressForCalendar = progress.levelProgress.find(p => p.level === viewingCalendar) || { completedDays: [] };

	return (
		<div className="min-h-screen bg-[#f8fafc] p-8 font-sans">
			<div className="max-w-6xl mx-auto">
				{/* Modern Header */}
				<div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 animate-fade-in">
					<div>
						<h1 className="text-4xl font-bold mb-2 font-heading tracking-tight text-[#0f172a]">
							Choose Your <span className="text-gradient">Level</span>
						</h1>
						<p className="text-gray-500 text-lg font-light max-w-xl">
							Complete one test per day to build your streak. consistency is key to mastering the language.
						</p>
					</div>
					<div className="flex gap-3">
						<button
							className="glass hover:bg-white/80 px-5 py-2.5 rounded-xl text-gray-700 flex items-center gap-2 transition-all hover:-translate-y-0.5"
							onClick={handleViewDashboard}
						>
							<FiBarChart2 className="w-5 h-5 text-indigo-500" />
							<span className="font-medium">Progress</span>
						</button>
						<button
							className="glass hover:bg-red-50 px-5 py-2.5 rounded-xl text-gray-700 flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:text-red-500"
							onClick={onLogout}
						>
							<FiLogOut className="w-5 h-5" />
							<span className="font-medium">Logout</span>
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{levels.map((level, index) => {
						const Icon = level.icon;
						const unlocked = isLevelUnlocked(currentUser, level.id);
						const completed = getLevelProgress(level.id);
						const isCompleted = completed >= 30;
						const canTakeToday = canTakeTestToday(currentUser, level.id);
						const nextDay = getNextDayNumber(currentUser, level.id);

						const iconBg = (() => {
							if (level.id === 1) return unlocked ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-200' : 'bg-gray-200';
							if (level.id === 2) return unlocked ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200' : 'bg-gray-200';
							if (level.id === 3) return unlocked ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-200' : 'bg-gray-200';
							if (level.id === 4) return unlocked ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-200' : 'bg-gray-200';
							return 'bg-gray-200';
						})();

						const progressBar = unlocked
							? level.id === 1
								? 'bg-gradient-to-r from-green-400 to-green-500'
								: level.id === 2
									? 'bg-gradient-to-r from-blue-400 to-blue-500'
									: level.id === 3
										? 'bg-gradient-to-r from-purple-400 to-purple-500'
										: 'bg-gradient-to-r from-amber-400 to-amber-500'
							: 'bg-gray-200';

						const mainBtn = unlocked
							? level.id === 1
								? 'bg-green-500 hover:bg-green-600 shadow-green-200/50'
								: level.id === 2
									? 'bg-blue-500 hover:bg-blue-600 shadow-blue-200/50'
									: level.id === 3
										? 'bg-purple-500 hover:bg-purple-600 shadow-purple-200/50'
										: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200/50'
							: 'bg-gray-100 text-gray-400';

						return (
							<div
								key={level.id}
								className={`glass bg-white/60 p-7 rounded-[1.5rem] transition-all transform will-change-transform flex flex-col gap-5 relative overflow-hidden group border border-white/50 animate-slide-up ${unlocked && canTakeToday
									? 'hover:shadow-xl hover:scale-[1.01] hover:-translate-y-1'
									: 'opacity-75 grayscale-[0.3]'
									}`}
								style={{ animationDelay: `${index * 100}ms` }}
							>
								{/* Decorative gradient blob */}
								{unlocked && (
									<div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-3xl ${progressBar}`}></div>
								)}

								<div className="flex items-center gap-5 relative z-10">
									<div className={`rounded-2xl flex items-center justify-center w-14 h-14 shadow-lg text-white transition-transform group-hover:scale-110 duration-300 ${iconBg}`}>
										{unlocked ? (
											<Icon className="w-7 h-7" />
										) : (
											<FiLock className="w-6 h-6 text-gray-400" />
										)}
									</div>
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-1">
											<span className="font-bold text-xl text-gray-800 font-heading tracking-tight">{level.title}</span>
											{!unlocked && (
												<span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 border border-gray-200">
													<FiLock className="w-3 h-3" /> Locked
												</span>
											)}
										</div>
										<p className="text-gray-500 text-sm leading-relaxed">
											{level.description}
										</p>
									</div>
								</div>

								{unlocked && (
									<div className="mt-2 relative z-10">
										<div className="flex justify-between text-sm mb-2 font-medium">
											<span className="text-gray-500">Progress</span>
											<span className="text-gray-800 font-bold">{completed} <span className="text-gray-400 font-normal">/ 30 days</span></span>
										</div>
										<div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
											<div
												className={`rounded-full transition-all duration-1000 h-full ${progressBar}`}
												style={{ width: `${(completed / 30) * 100}%` }}
											/>
										</div>
									</div>
								)}

								<div className="flex gap-3 mt-auto pt-2 relative z-10">
									{unlocked ? (
										<>
											<button
												className={`flex-1 ${mainBtn} text-white py-3 rounded-xl font-bold text-[0.95rem] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${canTakeToday && !isCompleted ? '' : 'opacity-70 cursor-not-allowed shadow-none'
													}`}
												disabled={!canTakeToday || isCompleted}
												onClick={() => handleLevelClick(level.id)}
											>
												{isCompleted ? '🎉 Level Completed!' : !canTakeToday ? "✓ Done for Today" : `Start Day ${nextDay}`}
											</button>
											<button
												className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95"
												onClick={() => setViewingCalendar(level.id)}
												title="View Calendar"
											>
												<FiCalendar className="w-5 h-5" />
											</button>
										</>
									) : (
										<button
											className="w-full py-3 rounded-xl font-semibold text-[0.95rem] bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed flex items-center justify-center gap-2"
											disabled
										>
											<FiLock className="w-4 h-4" /> Locked
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>

				{progress.levelProgress.length > 0 && (
					<div className="mt-12 glass bg-white/50 p-8 rounded-3xl animate-fade-in border border-white/60">
						<div className="flex flex-col md:flex-row items-center gap-8">
							<div className="w-full md:w-auto flex-1">
								<h2 className="font-bold mb-3 text-2xl text-gray-800 font-heading">Your Journey</h2>
								<div className="flex flex-wrap gap-4 text-sm text-gray-600">
									<div className="bg-white/80 px-4 py-2 rounded-lg shadow-sm border border-gray-100">
										Current Level: <span className="font-bold text-indigo-600 text-base ml-1">{progress.currentLevel}</span>
									</div>
									<div className="bg-white/80 px-4 py-2 rounded-lg shadow-sm border border-gray-100">
										Total Days: <span className="font-bold text-indigo-600 text-base ml-1">{progress.levelProgress.reduce((sum, lp) => sum + lp.completedDays.length, 0)}</span>
									</div>
								</div>
							</div>
							<div className="w-full md:w-auto md:max-w-sm text-sm text-gray-500 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
								<p>💡 Tip: Consistency is key! Finish your daily test to unlock the next day's challenge.</p>
							</div>
						</div>
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