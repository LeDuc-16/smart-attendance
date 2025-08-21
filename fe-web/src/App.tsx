import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardLayout from "./layout/DashboardLayout";
import ClassPage from "./pages/ClassPage";
import ClassRoomPage from "./pages/ClassRoomPage";
import LecturerPage from "./pages/LecturerPage";
import FacultyPage from "./pages/FacultyPage";
import GeneralPage from "./pages/GeneralPage";
import MajorPage from "./pages/MajorPage";
import StudentPage from "./pages/StudentPage";
import SubjectPage from "./pages/SubjectPage";
import TeachingPage from "./pages/TeachingPage";
import AttendancePage from "./pages/AttendancePage";
import LecturerDashboard from "./pages/LecturerDashboard";
import TeachingSchedulePage from "./pages/TeachingSchedulePage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<GeneralPage />} />
          <Route path="class" element={<ClassPage />} />
          <Route path="subject" element={<SubjectPage />} />
          <Route path="classroom" element={<ClassRoomPage />} />
          <Route path="lecturer" element={<LecturerPage />} />
          <Route path="faculty" element={<FacultyPage />} />
          <Route path="general" element={<GeneralPage />} />
          <Route path="major" element={<MajorPage />} />
          <Route path="student" element={<StudentPage />} />
          <Route path="teaching" element={<TeachingPage />} />
          <Route path="attendance" element={<AttendancePage />} />
        </Route>

        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/teaching-schedule" element={<TeachingSchedulePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
