import HeaderLecturer from "../components/HeaderLecturer";
import SidebarLecturer from "../components/SidebarLecturer";

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


import React, { useState } from "react";
// ...existing code...

const LecturerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar giảng viên */}
      <SidebarLecturer activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <HeaderLecturer lecturerName="Kiều Tuấn Dũng" />
        <main className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-700">Quản lý lịch giảng dạy và điểm danh sinh viên</h1>
            <p className="text-sm text-gray-500">Trường Đại học Thủy Lợi - Hệ thống điểm danh</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-blue-700">Lịch học hôm nay</h2>
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
