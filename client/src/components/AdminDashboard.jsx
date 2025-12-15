import React, { useState } from "react";
import { FiLogOut, FiUser, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

export default function AdminDashboard() {
  // sample teachers data
  const teachers = [
    {
      id: 1,
      name: "Sarah Johnson",
      daysCompleted: 3,
      level: "beginner",
      levelProgress: 3,
      levelTotal: 30,
      avgScore: "90%",
      tests: [
        {
          id: "d3",
          title: "Day 3",
          date: "October 17, 2025",
          speed: "248 WPM",
          quiz: "2/3",
          score: "86%",
          note: "Good progress! Your reading speed is consistent. You missed one question, so focus on understanding all details in the passage. Your pronunciation remains strong.",
        },
        {
          id: "d2",
          title: "Day 2",
          date: "October 16, 2025",
          speed: "250 WPM",
          quiz: "3/3",
          score: "91%",
          note: "Great job! Your reading speed has improved while maintaining high accuracy. Continue practicing to maintain this level of excellence.",
        },
      ],
    },
    {
      id: 2,
      name: "Michael Chen",
      daysCompleted: 1,
      level: "beginner",
      levelProgress: 1,
      levelTotal: 30,
      avgScore: "78%",
      tests: [
        {
          id: "m1",
          title: "Day 1",
          date: "October 15, 2025",
          speed: "230 WPM",
          quiz: "1/3",
          score: "78%",
          note: "A solid start. Work on comprehension for detail questions and gradually increase speed while keeping accuracy.",
        },
      ],
    },
  ];

  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  const totalTeachers = teachers.length;
  const totalDays = teachers.reduce((sum, t) => sum + t.daysCompleted, 0);
  const avgScore = (() => {
    const numeric = teachers
      .map((t) => parseInt(t.avgScore.replace("%", ""), 10))
      .reduce((s, v) => s + v, 0);
    return Math.round(numeric / Math.max(1, teachers.length)) + "%";
  })();

  const selected = teachers.find((t) => t.id === selectedId) || null;

  return (
    <div>
      <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="absolute top-4 left-4 p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 focus:outline-none cursor-pointer"
        >
          <IoArrowBack className="text-xl text-gray-700" />
        </button>
      <div className="min-h-screen bg-gray-50 p-4 mt-10 md:p-6 lg:pl-30 lg:pr-30">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 lg:mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-500 mt-1">
              Monitor all teachers' progress and performance
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-sm text-sm md:text-base text-gray-700 hover:bg-gray-50 w-full md:w-auto justify-center transition-all duration-200">
              <FiLogOut /> Logout
            </button>
          </div>
        </header>

        {/* Top metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 lg:mb-8">
          <div className="bg-white rounded-lg p-4 md:p-5 lg:p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
            <div className="text-sm md:text-base text-gray-500">
              Total Teachers
            </div>
            <div className="mt-2 text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900">
              {totalTeachers}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 md:p-5 lg:p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
            <div className="text-sm md:text-base text-gray-500">
              Total Days Completed
            </div>
            <div className="mt-2 text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900">
              {totalDays}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 md:p-5 lg:p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
            <div className="text-sm md:text-base text-gray-500">
              Average Score
            </div>
            <div className="mt-2 text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900">
              {avgScore}
            </div>
          </div>
        </div>

        {/* Main content: left teachers, right details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teachers Overview */}
          <div className="lg:col-span-1 bg-white rounded-lg p-4 md:p-5 lg:p-6 shadow-sm border border-gray-100">
            <h3 className="text-base md:text-lg font-medium text-gray-700 mb-1">
              Teachers Overview
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mb-4">
              Click on a teacher to view detailed progress
            </p>

            <div className="space-y-3 md:space-y-4">
              {teachers.map((t) => {
                const isSelected = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full text-left p-3 md:p-4 rounded-lg border transition-all duration-200 flex flex-col md:flex-row md:justify-between md:items-start gap-2 ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200 transform scale-[1.02]"
                        : "bg-white border-gray-100 hover:shadow-md hover:border-indigo-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm md:text-base font-semibold text-gray-900 truncate">
                        {t.name}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 mt-1">
                        {t.daysCompleted} days completed
                      </div>
                      <div className="inline-block mt-2 text-xs md:text-sm bg-green-100 text-green-700 px-2 md:px-3 py-1 rounded-full">
                        {t.level} {t.levelProgress}/{t.levelTotal}
                      </div>
                    </div>

                    <div className="text-sm md:text-base font-semibold text-indigo-600 md:self-start whitespace-nowrap">
                      {t.avgScore}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right side: select teacher or details */}
          <div className="lg:col-span-1 bg-white rounded-lg p-4 md:p-5 lg:p-6 shadow-sm border border-gray-100 min-h-[400px]">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
                <FiUser className="text-4xl md:text-5xl lg:text-6xl mb-4 text-gray-300" />
                <div className="text-sm md:text-base lg:text-lg text-gray-500">
                  Select a teacher from the list to view their details
                </div>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6 h-full">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h4 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                        {selected.name}'s Details
                      </h4>
                      <p className="text-sm md:text-base text-gray-500 truncate">
                        View test history and feedback
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs md:text-sm text-green-700 bg-green-100 px-2 md:px-3 py-1 rounded-full">
                          {selected.level}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm md:text-base font-medium text-gray-700">
                        Progress
                      </span>
                      <div className="text-sm md:text-base font-medium text-gray-800">
                        {selected.levelProgress} / {selected.levelTotal} days
                      </div>
                    </div>

                    <div className="w-full">
                      <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                        <div
                          className="h-2 md:h-3 rounded-full bg-purple-600 transition-all duration-500"
                          style={{
                            width: `${
                              (selected.levelProgress / selected.levelTotal) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-6 space-y-4">
                    <h5 className="text-sm md:text-base font-medium text-gray-700">
                      Recent Tests
                    </h5>
                    <div className="space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1 md:pr-2">
                      {selected.tests.map((test) => (
                        <div
                          key={test.id}
                          className="border border-gray-100 rounded-lg p-3 md:p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-gray-600 min-w-0">
                              <FiCalendar className="flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="font-semibold text-sm md:text-base truncate">
                                  {test.title}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400 truncate">
                                  {test.date}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 md:gap-4 text-sm md:text-base text-gray-600 mb-3">
                            <div>
                              <div className="text-xs md:text-sm text-gray-400">
                                Speed
                              </div>
                              <div className="font-medium text-sm md:text-base truncate">
                                {test.speed}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs md:text-sm text-gray-400">
                                Quiz
                              </div>
                              <div className="font-medium text-sm md:text-base truncate">
                                {test.quiz}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs md:text-sm text-gray-400">
                                Score
                              </div>
                              <div className="font-semibold text-indigo-600 text-sm md:text-base truncate">
                                {test.score}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs md:text-sm text-gray-700 bg-gray-50 p-2 md:p-3 rounded-lg">
                            {test.note}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
