import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingPage.jsx";
import TeacherLoginPage from "./components/TeacherLoginPage.jsx";
import AdminLoginPage from "./components/AdminLoginPage.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import LevelsPage from "./components/levelsPage.jsx";
import TestTakingPage from "./components/testTakingPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/teacherlogin" element={<TeacherLoginPage />} />
        <Route path="/adminlogin" element={<AdminLoginPage />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/levelsPage" element={<LevelsPage />} />
        <Route path="/testTakingPage" element={<TestTakingPage/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
