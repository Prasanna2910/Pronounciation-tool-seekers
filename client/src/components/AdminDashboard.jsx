import React, { useState, useEffect } from "react";
import { FiLogOut, FiUser, FiCalendar, FiBookOpen, FiActivity, FiClock, FiAward } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";

export default function AdminDashboard({ onLogout }) {
  const [teachers, setTeachers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("https://pronounciation-tool-seekers.onrender.com/user/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const transformed = data.map(u => ({
        id: u._id,
        name: u.name,
        daysCompleted: u.tests.length,
        level: u.level || 1,
        levelProgress: u.tests.length,
        levelTotal: 30,
        avgScore: u.tests.length > 0
          ? Math.round(u.tests.reduce((acc, t) => acc + (t.score || 0), 0) / u.tests.length) + "%"
          : "0%",
        tests: u.tests.map(t => ({
          id: t._id || Math.random(), // fallback
          title: `Day ${t.day}`,
          date: new Date().toLocaleDateString(), // We might need to save date in test result
          speed: `${Math.round(t.wpm || 0)} WPM`,
          quiz: `${t.correctAnswers || 0}/${t.totalQuestions || 3}`,
          pronunciation: `${Math.round(t.pronunciationScore || 0)}%`,
          score: `${Math.round(t.score || 0)}%`,
          note: t.feedback || "No feedback available"
        }))
      }));
      setTeachers(transformed);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalTeachers = teachers.length;
  const totalDays = teachers.reduce((sum, t) => sum + t.daysCompleted, 0);
  const avgScore = (() => {
    const numeric = teachers
      .map((t) => parseInt(t.avgScore.replace("%", ""), 10))
      .reduce((s, v) => s + v, 0);
    return Math.round(numeric / Math.max(1, teachers.length)) + "%";
  })();

  const selected = teachers.find((t) => t.id === selectedId) || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 animate-fade-in">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-white text-gray-600 shadow-sm hover:bg-gray-50 transition-all hover:-translate-x-1"
              >
                <IoArrowBack className="text-xl" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900 font-heading">
                Admin <span className="text-gradient">Dashboard</span>
              </h1>
            </div>
            <p className="text-gray-500 text-lg">
              Monitor teacher progress and performance metrics
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/tests")}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 font-medium"
            >
              <FiBookOpen /> Manage Tests
            </button>
            <button
              onClick={() => {
                if (onLogout) onLogout();
                else {
                  localStorage.removeItem("token");
                  localStorage.removeItem("role");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }
              }}
              className="px-5 py-2.5 glass hover:bg-red-50 text-gray-700 hover:text-red-500 rounded-xl transition-all flex items-center gap-2 font-medium"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
          <div className="glass bg-white/60 p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <FiUser className="text-2xl" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Teachers</div>
                <div className="text-3xl font-bold text-gray-800 font-heading">{totalTeachers}</div>
              </div>
            </div>
          </div>

          <div className="glass bg-white/60 p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <FiCalendar className="text-2xl" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Days Completed</div>
                <div className="text-3xl font-bold text-gray-800 font-heading">{totalDays}</div>
              </div>
            </div>
          </div>

          <div className="glass bg-white/60 p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <FiActivity className="text-2xl" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Average Score</div>
                <div className="text-3xl font-bold text-gray-800 font-heading">{avgScore}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teachers List */}
          <div className="glass bg-white/80 rounded-2xl p-6 shadow-sm border border-white/60 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-xl font-bold text-gray-800 mb-1 font-heading">
              Teachers Overview
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Select a teacher to view details
            </p>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {teachers.map((t) => {
                const isSelected = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col md:flex-row md:justify-between md:items-center gap-3 group ${isSelected
                      ? "bg-indigo-50 border-indigo-200 shadow-md ring-1 ring-indigo-200"
                      : "bg-white border-gray-100 hover:border-indigo-100 hover:shadow-md hover:bg-gray-50/50"
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${t.daysCompleted > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className="text-base font-bold text-gray-900 truncate font-heading group-hover:text-indigo-700 transition-colors">
                          {t.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                          Level {t.level}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 font-medium">
                          Day {t.levelProgress}/30
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="text-lg font-bold text-indigo-600 font-heading">
                        {t.avgScore}
                      </div>
                      <div className="text-xs text-gray-400 font-medium">Avg Score</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Panel */}
          <div className="glass bg-white/80 rounded-2xl p-6 shadow-sm border border-white/60 min-h-[500px] animate-slide-up" style={{ animationDelay: '200ms' }}>
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <FiUser className="text-5xl text-gray-300" />
                </div>
                <h4 className="text-xl font-medium text-gray-500 font-heading">No Teacher Selected</h4>
                <p className="text-sm text-gray-400 mt-2 max-w-xs">
                  Click on a teacher card from the list to view their detailed performance and test history.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-start justify-between pb-6 border-b border-gray-100">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 font-heading">
                      {selected.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      User ID: {selected.id}
                    </p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                    Level {selected.level}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700">Course Progress</span>
                    <span className="text-sm font-bold text-indigo-600">{selected.levelProgress} / {selected.levelTotal} Days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-1000 ease-out"
                      style={{
                        width: `${(selected.levelProgress / selected.levelTotal) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-lg font-bold text-gray-800 font-heading flex items-center gap-2">
                    <FiClock className="text-gray-400" /> Recent Tests
                  </h5>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                    {selected.tests.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">No tests completed yet.</p>
                    ) : selected.tests.map((test) => (
                      <div
                        key={test.id}
                        className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
                          <div>
                            <div className="font-bold text-gray-900 text-sm">
                              {test.title}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {test.date}
                            </div>
                          </div>
                          <div className="text-xs font-mono text-gray-300">ID: {test.id}</div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Speed</div>
                            <div className="font-bold text-gray-700 text-sm">{test.speed}</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Quiz</div>
                            <div className="font-bold text-gray-700 text-sm">{test.quiz}</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Pron.</div>
                            <div className="font-bold text-gray-700 text-sm">{test.pronunciation}</div>
                          </div>
                          <div className="text-center p-2 bg-indigo-50 rounded-lg">
                            <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Score</div>
                            <div className="font-bold text-indigo-700 text-sm">{test.score}</div>
                          </div>
                        </div>
                        {test.note && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg italic">
                            "{test.note}"
                          </div>
                        )}
                      </div>
                    ))}
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
