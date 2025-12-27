import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingPage.jsx";
import TeacherLoginPage from "./components/TeacherLoginPage.jsx";
import AdminLoginPage from "./components/AdminLoginPage.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import LevelsPage from "./components/levelsPage.jsx";
import TestTakingPage from "./components/testTakingPage.jsx";
import ResultPage from "./components/ResultPage.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/teacherlogin" element={<TeacherLoginPage />} />
        <Route path="/adminlogin" element={<AdminLoginPage />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/levelsPage" element={<LevelsPage />} />
        <Route path="/testTakingPage" element={<TestTakingPage/>}></Route>
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </Router>
    </GoogleOAuthProvider>
  );
}

export default App;