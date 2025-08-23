import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./layout/DashboardLayout";
import ClassRoomPage from "./pages/ClassRoomPage";
import LecturerPage from "./pages/LecturerPage";
import FacultyPage from "./pages/FacultyPage";
import MajorPage from "./pages/MajorPage";
import StudentPage from "./pages/StudentPage";
import AttendancePage from "./pages/AttendancePage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="classroom" element={<ClassRoomPage />} />
          <Route path="lecturer" element={<LecturerPage />} />
          <Route path="faculty" element={<FacultyPage />} />
          <Route path="major" element={<MajorPage />} />
          <Route path="student" element={<StudentPage />} />
          <Route path="attendance" element={<AttendancePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
