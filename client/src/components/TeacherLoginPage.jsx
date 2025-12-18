import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";

export default function TeacherLoginPage() {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    let resp;

    if (mode === "login") {
      resp = await axios.post("http://localhost:5000/user/login", {
        email: email,
        password: password,
      });
    } else {
      resp = await axios.post("http://localhost:5000/user/signup", {
        name: fullName,
        email: email,
        password: password,
      });
    }

    const name = resp.data.user.name;
    const level = resp.data.user.level;
    const token = resp.data.token;

    const userObj = {
      name: name,
      level: level,
    };

    localStorage.setItem("user", JSON.stringify(userObj));
    localStorage.setItem("token", token);

    navigate("/levelsPage");

  } catch (err) {
    console.error(`${mode} error:`, err);
  }
};

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-50 font-sans">
      {/* Back button (top-left) */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="absolute top-4 left-4 p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 focus:outline-none cursor-pointer"
      >
        <IoArrowBack className="text-xl text-gray-700" />
      </button>

      <div
        className="w-[450px] max-w-full bg-white rounded-xl shadow-md p-10 text-center"
        role="main"
        aria-labelledby="tlp-title"
      >
        <h2
          id="tlp-title"
          className="text-gray-900 font-rubik font-semibold text-2xl mb-1"
        >
          Login
        </h2>
        <p className="text-gray-500 text-lg mb-4">
          Improve your reading skills with timed comprehension tests
        </p>

        <div
          className="flex bg-gray-100 p-1 rounded-full w-full my-2 gap-2"
          role="tablist"
          aria-label="auth mode"
        >
          <button
            type="button"
            className={`flex-1 cursor-pointer py-2 rounded-full text-sm font-semibold transition ${
              mode === "login"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
            onClick={() => setMode("login")}
            aria-selected={mode === "login"}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2 cursor-pointer rounded-full text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
            onClick={() => setMode("signup")}
            aria-selected={mode === "signup"}
          >
            Sign Up
          </button>
        </div>

        <form className="text-left mt-2" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <label className="block text-sm text-gray-600 mt-3 mb-1">
                Full name
              </label>
              <input
                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={mode === "signup"}
              />
            </>
          )}

          <label className="block text-sm text-gray-600 mt-3 mb-1">Email</label>
          <input
            className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block text-sm text-gray-600 mt-3 mb-1">
            Password
          </label>
          <input
            className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="mt-4 cursor-pointer w-full py-2 rounded-lg text-white font-semibold bg-[#6366f1] shadow-md"
            type="submit"
          >
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
