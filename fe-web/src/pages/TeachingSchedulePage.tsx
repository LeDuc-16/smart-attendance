import React, { useState, useEffect } from "react";
import SidebarLecturer from "../components/SidebarLecturer";
import HeaderLecturer from "../components/HeaderLecturer";
import { getSchedulesByDate } from "../api/apiTeaching";
import type { TeachingSchedule } from "../api/apiTeaching";
import { getCourses } from "../api/apiCourse";
import { getClassRooms } from "../api/apiClassRoom";
import { getClasses } from "../api/apiClass";

const TeachingSchedulePage = () => {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("2025-08-05");
  const [activeTab, setActiveTab] = useState("teaching-schedule");
  const [scheduleData, setScheduleData] = useState<TeachingSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const schedules = await getSchedulesByDate(date);
        // Lấy tất cả courses, rooms, classes một lần
        const coursesRes = await getCourses();
        const rooms = await getClassRooms();
        const classesRes = await getClasses();
        console.log("coursesRes:", coursesRes);
        console.log("classesRes:", classesRes);
  const courses: any[] = (coursesRes as any).data;
  const classes: any[] = (classesRes as any).data;

        // Lọc lịch theo ngày được chọn
        const filteredSchedules = schedules.filter((item) =>
          item.weeks.some((week) =>
            week.studyDays.some((day) => day.date === date)
          )
        );
        // Map lại dữ liệu lịch giảng dạy
        const enriched = filteredSchedules.map((item) => {
          const course = courses.find((c: any) => c.id === item.courseId);
          const room = rooms.find((r: any) => r.id === item.roomId);
          const classInfo = classes.find((cl: any) => cl.id === item.classId);
          return {
            ...item,
            // Môn học là className, tên lớp là courseName
            className: classInfo?.className || '',
            courseName: course?.courseName || '',
            roomCode: room?.roomCode || '',
            capacityStudent: classInfo?.capacityStudent,
          };
        });
        console.log("courses:", courses);
        console.log("classes:", classes);
        console.log("enriched:", enriched);
        setScheduleData(enriched);
      } catch (err) {
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [date]);

  // --- Main Teaching Schedule Page Component ---

  const formattedDate = new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarLecturer activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <HeaderLecturer lecturerName="Kiều Tuấn Dũng" />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-6">
            <h1
              className={`text-2xl font-bold cursor-pointer ${
                activeTab === "teaching-schedule"
                  ? "text-blue-700"
                  : "text-gray-800"
              }`}
              onClick={() => setActiveTab("teaching-schedule")}
            >
              Lịch giảng dạy
            </h1>
            <p className="text-sm text-gray-500">
              Quản lý và theo dõi lịch giảng dạy một cách hiệu quả
            </p>
          </div>

          {/* Search and Date Filters */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm theo môn học, phòng học..."
                className="w-full border rounded-lg px-4 py-2 pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="relative w-full md:w-auto">
              <input
                type="date"
                className="w-full md:w-auto border rounded-lg px-4 py-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Schedule Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-700 ">
                Lịch giảng dạy
              </h2>
              <p className="text-sm text-gray-500">
                Lịch giảng dạy ngày {formattedDate}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-blue-50 text-gray-600">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Môn học</th>
                    <th className="py-3 px-4 font-semibold">Tên lớp</th>
                    <th className="py-3 px-4 font-semibold">Thời gian</th>
                    <th className="py-3 px-4 font-semibold">Phòng</th>
                    <th className="py-3 px-4 font-semibold">Sĩ số</th>
                    <th className="py-3 px-4 font-semibold text-center">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : scheduleData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6">
                        Không có dữ liệu lịch giảng dạy
                      </td>
                    </tr>
                  ) : (
                    scheduleData
                      .filter(
                        (item) =>
                          item.courseName
                            ?.toLowerCase()
                            .includes(search.toLowerCase()) ||
                          item.roomCode
                            ?.toLowerCase()
                            .includes(search.toLowerCase())
                      )
                      .map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">{item.courseName}</td>
                          <td className="py-3 px-4">{item.className}</td>
                          <td className="py-3 px-4">
                            {item.startTime} - {item.endTime}
                          </td>
                          <td className="py-3 px-4">{item.roomCode}</td>
                          <td className="py-3 px-4">{item.capacityStudent !== undefined ? item.capacityStudent : '-'}</td>
                          <td className="py-3 px-4 flex justify-center">
                            <button
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-full focus:outline-none"
                              title="Chỉnh sửa"
                            >
                              <span className="material-icons">edit</span>
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeachingSchedulePage;
