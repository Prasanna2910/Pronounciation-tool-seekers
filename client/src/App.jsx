import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingPage.jsx";
import TeacherLoginPage from "./components/TeacherLoginPage.jsx";
import AdminLoginPage from "./components/AdminLoginPage.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/teacherlogin" element={<TeacherLoginPage />} />
        <Route path="/adminlogin" element={<AdminLoginPage />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
