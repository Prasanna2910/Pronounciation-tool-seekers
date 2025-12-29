import React from "react";
import { LuShield } from "react-icons/lu";
import { FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-5xl w-full text-center mb-8">
        <h1 className="text-2xl font-medium text-gray-900">
          Welcome to Reading Comprehension Platform
        </h1>
        <h4 className="text-base mt-2 text-gray-600">
          Please select your role to continue
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="cursor-pointer flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200">
          <div className="mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-purple-600">
              <LuShield className="text-2xl text-white" />
            </div>
          </div>

          <div className="text-lg font-semibold">Admin</div>
          <div className="text-base text-gray-600 text-center">
            View all teachers' progress, scores and feedback
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-6 w-full py-2 rounded-md text-white bg-purple-600 hover:bg-purple-800 focus:outline-none cursor-pointer"
          >
            Continue as Admin
          </button>
        </div>

        <div className="cursor-pointer flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200">
          <div className="mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-600">
              <FaUsers className="text-2xl text-white" />
            </div>
          </div>

          <div className="text-lg font-semibold">Teacher</div>
          <div className="text-base text-gray-600 text-center">
            Take Comprehension tests and track your progress
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-6 w-full py-2 rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none cursor-pointer"
          >
            Continue as Teacher
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
