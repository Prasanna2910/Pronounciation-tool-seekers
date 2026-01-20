import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/landingPage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AdminTestManagement from "./components/LevelsManagement.jsx";
import LevelsPage from "./components/LevelsPage.jsx";
import TestTakingPage from "./components/testTakingPage.jsx";
import ResultPage from "./components/ResultPage.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState } from "react";

function App() {
  const [auth, setAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setAuth(false);
    setIsAdmin(false);
    <Navigate to="/login" />;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) setAuth(true);
    if (role === "admin") setIsAdmin(true);
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>

          <Route
            path="/"
            element={auth ? (isAdmin ? <Navigate to="/admindashboard" /> : <Navigate to="/levelsPage" />) : <LandingPage />}
          />

          <Route
            path="/login"
            element={auth ? (isAdmin ? <Navigate to="/admindashboard" /> : <Navigate to="/levelsPage" />) : <LoginPage />}
          />

          <Route
            path="/teacherlogin"
            element={<Navigate to="/login" />}
          />

          <Route
            path="/adminlogin"
            element={<Navigate to="/login" />}
          />

          <Route
            path="/admindashboard"
            element={auth && isAdmin ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/" />}
          />

          <Route
            path="/admin/tests"
            element={auth && isAdmin ? <AdminTestManagement onLogout={handleLogout} /> : <Navigate to="/" />}
          />

          <Route
            path="/levelsPage"
            element={auth ? <LevelsPage onLogout={handleLogout} /> : <Navigate to="/" />}
          />

          <Route
            path="/testTakingPage"
            element={auth ? <TestTakingPage /> : <Navigate to="/" />}
          />

          <Route
            path="/result"
            element={auth ? <ResultPage /> : <Navigate to="/" />}
          />

        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
