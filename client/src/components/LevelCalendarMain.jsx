import React from 'react';

// Level Calendar Modal Component
const LevelCalendar = ({ level, onClose, userProgress }) => {
	// Get progress data from props
	// userProgress is expected to be: { completedDays: [...], tests: [...] }
	const currentLevelData = userProgress || { completedDays: [], tests: [] };
	const completedDays = currentLevelData.completedDays || [];

	// Calculate current day based on completed days
	const currentDay = completedDays.length + 1;

	const levels = [
		{ id: 1, name: 'Beginner', color: 'bg-green-500', textColor: 'text-green-600', borderColor: 'border-green-500' },
		{ id: 2, name: 'Expert', color: 'bg-blue-500', textColor: 'text-blue-600', borderColor: 'border-blue-500' },
		{ id: 3, name: 'Pro', color: 'bg-purple-400', textColor: 'text-purple-600', borderColor: 'border-purple-400' },
		{ id: 4, name: 'Master', color: 'bg-yellow-400', textColor: 'text-yellow-600', borderColor: 'border-yellow-400' }
	];

	const totalDays = 30;

	const currentLevelInfo = levels.find(l => l.id === level) || levels[0];

	const handleDayClick = (day) => {
		if (completedDays.includes(day)) {
			alert(`Day ${day} - View detailed results here`);
		}
	};

	const getDayStatus = (day) => {
		if (completedDays.includes(day)) return 'completed';
		if (day === currentDay) return 'current';
		return 'locked';
	};

	// Lock icon SVG
	const LockIcon = ({ size = 16, className = "" }) => (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
			<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
		</svg>
	);

	// X icon SVG
	const XIcon = ({ size = 28, className = "" }) => (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
			<line x1="18" y1="6" x2="6" y2="18"></line>
			<line x1="6" y1="6" x2="18" y2="18"></line>
		</svg>
	);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="p-8 pb-6 relative border-b border-gray-200">
					<button
						onClick={onClose}
						className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Close"
					>
						<XIcon />
					</button>
					<h2 className="text-3xl font-bold text-gray-900 capitalize">{currentLevelInfo.name} Level - Calendar</h2>
					<p className="text-gray-500 mt-2 text-lg">Track your 30-day journey through this level</p>
				</div>

				<div className="px-8 pb-8 pt-6 flex flex-col lg:flex-row gap-8">
					{/* Main Calendar Section */}
					<div className="flex-1">
						{/* Calendar Grid */}
						<div className="grid grid-cols-5 sm:grid-cols-10 gap-3 mb-8">
							{Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
								const status = getDayStatus(day);
								const testForDay = currentLevelData.tests?.find(t => t.day === day);
								const testDate = testForDay ? new Date(testForDay.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;

								return (
									<button
										key={day}
										onClick={() => handleDayClick(day)}
										disabled={status === 'locked'}
										className={`
											relative aspect-square rounded-2xl flex flex-col items-center justify-center
											transition-all duration-200 border-2
											${status === 'completed'
												? `bg-white ${currentLevelInfo.borderColor} ${currentLevelInfo.textColor} cursor-pointer hover:bg-green-50`
												: status === 'current'
													? `bg-white ${currentLevelInfo.borderColor} ${currentLevelInfo.textColor} shadow-md`
													: 'bg-white border-gray-200 text-gray-400 cursor-not-allowed'
											}
										`}
									>
										<span className="text-xs text-gray-400 font-medium mb-0.5">Day</span>
										<span className="text-xl font-bold mb-1">{day}</span>
										{status === 'completed' && testDate && (
											<span className="text-[0.65rem] font-medium opacity-80">{testDate}</span>
										)}

										{status === 'completed' && (
											<div className="absolute bottom-1 right-1">
												<div className={`w-4 h-4 ${currentLevelInfo.color} rounded-full flex items-center justify-center`}>
													<svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
													</svg>
												</div>
											</div>
										)}

										{status === 'current' && (
											<div className="absolute bottom-2">
												<div className={`w-5 h-5 border-3 ${currentLevelInfo.borderColor} rounded-full bg-white`} />
											</div>
										)}

										{status === 'locked' && (
											<div className="absolute bottom-2">
												<LockIcon size={16} className="text-gray-300" />
											</div>
										)}
									</button>
								);
							})}
						</div>

						{/* Status Info */}
						<div className="flex flex-wrap items-center gap-6">
							{/* Completed */}
							<div className="flex items-center gap-3">
								<div className={`w-7 h-7 ${currentLevelInfo.color} rounded-full flex items-center justify-center flex-shrink-0`}>
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<p className="text-sm text-gray-600">Completed</p>
									<p className="text-xl font-bold text-gray-900">{completedDays.length} days</p>
								</div>
							</div>

							{/* Current */}
							<div className="flex items-center gap-3">
								<div className={`w-7 h-7 border-3 ${currentLevelInfo.borderColor} rounded-full flex-shrink-0 bg-white`} />
								<div>
									<p className="text-sm text-gray-600">Current</p>
									<p className="text-xl font-bold text-gray-900">Day {currentDay}</p>
								</div>
							</div>

							{/* Remaining */}
							<div className="flex items-center gap-3">
								<div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
									<LockIcon size={16} className="text-gray-400" />
								</div>
								<div>
									<p className="text-sm text-gray-600">Remaining</p>
									<p className="text-xl font-bold text-gray-900">{totalDays - completedDays.length} days</p>
								</div>
							</div>
						</div>
					</div>

					{/* Right Sidebar */}
					<div className="w-full lg:w-80 flex flex-col gap-6">
						{/* Helper Text */}
						<div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-4">
							<div className="w-14 h-14 border-3 border-gray-300 rounded-full flex-shrink-0" />
							<div>
								<p className="text-sm text-gray-600 leading-relaxed">
									Click on a completed day to view <span className="font-semibold text-gray-800">detailed results</span>
								</p>
							</div>
						</div>

						{/* Info Card */}
						<div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
							<div className="flex items-start gap-3">
								<div className="text-blue-500 text-xl">💡</div>
								<div>
									<h4 className="text-sm font-semibold text-blue-900 mb-1">One Test Per Day</h4>
									<p className="text-xs text-blue-700 leading-relaxed">
										Complete all 30 days of {currentLevelInfo.name} level to unlock the next level. You can only take one test per day!
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LevelCalendar;