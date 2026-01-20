import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
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
        resp = await axios.post("https://pronounciation-tool-seekers.onrender.com/user/login", {
          email,
          password,
        });
      } else {
        resp = await axios.post("https://pronounciation-tool-seekers.onrender.com/user/signup", {
          name: fullName,
          email,
          password,
        });
      }

      const { user, token } = resp.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role || "user");

      if (user.role === "admin") {
        window.location.href = "/admindashboard";
      } else {
        window.location.href = "/levelsPage";
      }
    } catch (err) {
      console.error(`${mode} error:`, err);
      alert("Authentication failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      const resp = await axios.post("https://pronounciation-tool-seekers.onrender.com/user/google", {
        email: decoded.email,
        name: decoded.name,
      });

      const { user, token } = resp.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role || "Admin");
      localStorage.setItem("token", token);

      if (user.role === "admin") {
        window.location.href = "/admindashboard";
      } else {
        window.location.href = "/levelsPage";
      }
    } catch (err) {
      console.error("Google auth error:", err);
      alert("Google login failed");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-50 font-sans">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 rounded-full bg-white shadow-sm hover:bg-gray-100"
      >
        <IoArrowBack className="text-xl text-gray-700" />
      </button>

      <div className="w-[450px] max-w-full bg-white rounded-xl shadow-md p-10 text-center">
        <h2 className="text-gray-900 font-semibold text-2xl mb-1">
          {mode === "login" ? "Login" : "Sign Up"}
        </h2>
        <p className="text-gray-500 text-lg mb-4">
          Improve your reading skills with timed comprehension tests
        </p>
        <div className="flex bg-gray-100 p-1 rounded-full w-full my-2 gap-2">
          <button
            className={`flex-1 py-2 rounded-full text-sm font-semibold ${mode === "login"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600"
              }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-full text-sm font-semibold ${mode === "signup"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600"
              }`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form className="text-left mt-2" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <label className="block text-sm text-gray-600 mt-3 mb-1">
                Full Name
              </label>
              <input
                className="w-full px-3 py-2 rounded-md border border-gray-200"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </>
          )}

          <label className="block text-sm text-gray-600 mt-3 mb-1">Email</label>
          <input
            className="w-full px-3 py-2 rounded-md border border-gray-200"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block text-sm text-gray-600 mt-3 mb-1">
            Password
          </label>
          <input
            className="w-full px-3 py-2 rounded-md border border-gray-200"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="mt-4 w-full py-2 rounded-lg text-white font-semibold bg-indigo-500"
          >
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="my-4 text-gray-400 text-sm">OR</div>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Login Failed")}
          />
        </div>
      </div>
    </div>
  );
}
