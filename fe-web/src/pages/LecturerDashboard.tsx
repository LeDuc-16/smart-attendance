import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Data for the schedule table, updated to match the image
const scheduleToday = [
  {
    subject: "Quản trị dự án",
    className: "64KTPM3",
    time: "07:00 - 09:25",
    room: "205-B5",
    students: 40,
    status: "Đang diễn ra",
    statusType: "active",
  },
  {
    subject: "Lập trình web",
    className: "64KTPM3",
    time: "09:35 - 11:50",
    room: "205-B5",
    students: 40,
    status: "Sắp tới",
    statusType: "upcoming",
  },
  {
    subject: "Cấu trúc dữ liệu và giải thuật",
    className: "64DHKHMT",
    time: "12:00 - 14:25",
    room: "205-B5",
    students: 40,
    status: "Đang diễn ra",
    statusType: "active",
  },
];

// SVG Icon Components for the sidebar
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);


const LecturerDashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to handle logout
  const navigate = useNavigate();
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("token");
    setIsDropdownOpen(false);
    navigate("/login", { replace: true });
  };

  // Effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0B2D5B] text-white flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-blue-800">
          <img 
            src="https://www.tlu.edu.vn/Portals/0/2014/Logo-WRU.png" 
            alt="TLU Logo" 
            className="h-10 w-10 rounded-full bg-white p-1"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/40x40/FFFFFF/0B2D5B?text=TLU';
            }}
          />
          <div>
            <div className="font-bold text-xs whitespace-nowrap">TRƯỜNG ĐẠI HỌC THỦY LỢI</div>
            <div className="text-xs text-blue-300">HỆ THỐNG ĐIỂM DANH</div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4">
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-md bg-blue-700 text-white font-semibold">
            <HomeIcon />
            Trang chủ
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-md hover:bg-blue-800 text-blue-200">
            <CalendarIcon />
            Lịch giảng dạy
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-md hover:bg-blue-800 text-blue-200">
            <CheckCircleIcon />
            Điểm danh
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-md hover:bg-blue-800 text-blue-200">
            <ChartBarIcon />
            Báo cáo
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-end px-8 py-4 bg-white">
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 cursor-pointer">
              <img 
                  src="https://placehold.co/40x40/E2E8F0/4A5568?text=AVT" 
                  alt="Avatar" 
                  className="h-10 w-10 rounded-full border-2 border-gray-200"
              />
              <div className="text-right">
                <div className="font-semibold text-sm text-gray-800">Bùi Đức Lương</div>
                <div className="text-xs text-gray-500">Giảng viên</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                <a
                  href="#"
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Đăng xuất
                </a>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý lịch giảng dạy và điểm danh sinh viên</h1>
            <p className="text-sm text-gray-500">Trường Đại học Thủy Lợi - Hệ thống điểm danh</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-800">Lịch học hôm nay</h2>
                <p className="text-sm text-gray-500">Thứ 2, 15 Tháng 1, 2025</p>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="py-3 px-4 font-semibold">Môn học</th>
                  <th className="py-3 px-4 font-semibold">Tên lớp</th>
                  <th className="py-3 px-4 font-semibold">Thời gian</th>
                  <th className="py-3 px-4 font-semibold">Phòng</th>
                  <th className="py-3 px-4 font-semibold">Sĩ số</th>
                  <th className="py-3 px-4 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {scheduleToday.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4">{item.subject}</td>
                    <td className="py-3 px-4">{item.className}</td>
                    <td className="py-3 px-4">{item.time}</td>
                    <td className="py-3 px-4">{item.room}</td>
                    <td className="py-3 px-4">{item.students}</td>
                    <td className="py-3 px-4">
                      {item.statusType === "active" ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">{item.status}</span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">{item.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LecturerDashboard;
