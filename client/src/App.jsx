import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingPage.jsx";
import TeacherLoginPage from "./components/TeacherLoginPage.jsx";
import LevelsPage from "./components/levelsPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/teacherlogin" element={<TeacherLoginPage />} />
        <Route path="/levelsPage" element={<LevelsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
