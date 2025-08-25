
import SidebarLecturer from "../components/SidebarLecturer";
import HeaderLecturer from "../components/HeaderLecturer";
import { useLocation } from "react-router-dom";

const LecturerReports = () => {
  const location = useLocation();
  let activeTab = "report";
  if (location.pathname === "/teaching-schedule") activeTab = "teaching-schedule";
  else if (location.pathname === "/lecturer-reports") activeTab = "report";
  else if (location.pathname === "/lecturer-dashboard") activeTab = "dashboard";
  else if (location.pathname === "/attendance") activeTab = "attendance";
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <SidebarLecturer activeTab={activeTab} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <HeaderLecturer lecturerName="Kiều Tuấn Dũng" />
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-800">Báo cáo điểm danh sinh viên</h1>
            <p className="text-sm text-gray-500">Thống kê các buổi điểm danh bằng nhận diện khuôn mặt</p>
          </div>
          {/* Bộ lọc báo cáo */}
          <div className="bg-white rounded-lg border border-blue-100 p-6 mb-6 flex flex-col md:flex-row gap-4 items-center">
            <select className="border rounded px-4 py-2 text-gray-700">
              <option>HKI 2024 - 2025</option>
            </select>
            <select className="border rounded px-4 py-2 text-gray-700">
              <option>Tất cả lớp</option>
            </select>
            <select className="border rounded px-4 py-2 text-gray-700">
              <option>Tổng quan</option>
            </select>
            <div className="relative w-full md:w-64">
              <input type="text" className="border rounded px-4 py-2 w-full pl-10" placeholder="Tên hoặc MSV..." />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>
          {/* Hiệu suất điểm danh theo lớp */}
          <div className="bg-white rounded-lg border border-blue-100 p-6">
            <h2 className="text-lg font-bold text-blue-800 mb-2">Hiệu suất điểm danh theo lớp</h2>
            <p className="text-sm text-gray-500 mb-4">Tổng quan tỷ lệ điểm danh của từng lớp học</p>
            <div className="space-y-3">
              {/* Card lớp */}
              {[
                { code: '64KTPM3', name: 'Lập trình Web', total: 45, attended: 42 },
                { code: '62CNTT4', name: 'Cơ sở dữ liệu', total: 40, attended: 37 },
                { code: '65HTTT2', name: 'Cấu trúc dữ liệu và giải thuật', total: 35, attended: 34 },
                { code: '66KTPM1', name: 'Lập trình nâng cao', total: 35, attended: 34 },
                { code: '66KTPM2', name: 'Lập trình Python', total: 35, attended: 34 },
              ].map((cls, idx) => (
                <div key={idx} className="flex items-center justify-between border rounded px-4 py-3 bg-white shadow-sm">
                  <div>
                    <div className="font-semibold">{cls.code} - {cls.name}</div>
                    <div className="text-xs text-gray-500">15/15 buổi | {cls.total} sinh viên</div>
                  </div>
                  <div className={`font-bold ${cls.attended >= cls.total * 0.9 ? 'text-green-600' : 'text-red-500'}`}>{cls.attended}/{cls.total}</div>
                  <button className="flex items-center gap-1 px-3 py-1 border rounded text-gray-700 hover:bg-gray-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17l4 4 4-4m0-5V3a1 1 0 00-1-1H7a1 1 0 00-1 1v9" />
                    </svg>
                    Chi tiết
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LecturerReports;