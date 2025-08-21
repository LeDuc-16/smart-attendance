import React, { useState, useEffect } from "react";
import SidebarLecturer from "../components/SidebarLecturer";
import HeaderLecturer from "../components/HeaderLecturer";
import EditScheduleModal from "../components/EditScheduleModal";
import { getSchedulesByDate } from "../api/apiTeaching";
import type { TeachingSchedule } from "../api/apiTeaching";
import { getCourses } from "../api/apiCourse";
import { getClassRooms } from "../api/apiClassRoom";
import { getClasses } from "../api/apiClass";

const TeachingSchedulePage = () => {
  // Format giờ phút an toàn
  function formatTime(str: string) {
    if (!str) return "";
    // Nếu chuỗi chỉ có dạng HH:mm thì trả về luôn
    if (/^\d{2}:\d{2}$/.test(str)) return str;
    // Nếu là dạng ISO thì lấy giờ phút
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<TeachingSchedule | null>(null);
  const [search, setSearch] = useState("");

  function getTodayString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const [date, setDate] = useState(getTodayString());
  const [activeTab, setActiveTab] = useState("teaching-schedule");
  const [scheduleData, setScheduleData] = useState<TeachingSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const schedules = await getSchedulesByDate(date);
        const coursesRes = await getCourses();
        const rooms = await getClassRooms();
        const classesRes = await getClasses();

        const courses: any[] = (coursesRes as any).data;
        const classes: any[] = (classesRes as any).data;

        const filteredSchedules = schedules.filter((item: any) =>
          item.weeks.some((week: any) =>
            week.studyDays.some((day: any) => day.date === date)
          )
        );

        const enriched = filteredSchedules.map((item: any) => {
          const course = courses.find((c: any) => c.id === item.courseId);
          const room = rooms.find((r: any) => r.id === item.roomId);
          const classInfo = classes.find((cl: any) => cl.id === item.classId);
          return {
            ...item,
            className: classInfo?.className || "",
            courseName: course?.courseName || "",
            roomCode: room?.roomCode || "",
            capacityStudent: classInfo?.capacityStudent,
          };
        });

        setScheduleData(enriched);
      } catch (err) {
        console.error("Failed to fetch schedule data:", err);
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [date]);

  const handleEditClick = (item: TeachingSchedule) => {
    setEditData(item);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditData(null);
  };

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <SidebarLecturer activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <HeaderLecturer lecturerName="Kiều Tuấn Dũng" />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Lịch giảng dạy</h1>
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
                className="w-full border rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
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
                className="w-full md:w-auto border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Schedule Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-700">
                Lịch giảng dạy
              </h2>
              <p className="text-sm text-gray-500">
                Lịch giảng dạy ngày {formattedDate}
              </p>
            </div>
            <EditScheduleModal
              show={showEditModal}
              data={editData}
              onClose={handleCloseModal}
              onCancel={() => setShowEditModal(false)}
              formatTime={formatTime}
            />
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
                      Hành động
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
                        (item: TeachingSchedule) =>
                          item.courseName
                            ?.toLowerCase()
                            .includes(search.toLowerCase()) ||
                          item.roomCode
                            ?.toLowerCase()
                            .includes(search.toLowerCase())
                      )
                      .map((item: TeachingSchedule, idx: number) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">{item.courseName}</td>
                          <td className="py-3 px-4">{item.className}</td>
                          <td className="py-3 px-4">
                            {formatTime(item.startTime)} -{" "}
                            {formatTime(item.endTime)}
                          </td>
                          <td className="py-3 px-4">{item.roomCode}</td>
                          <td className="py-3 px-4">
                            {item.capacityStudent ?? "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-full focus:outline-none transition-colors"
                              title="Chỉnh sửa"
                              onClick={() => handleEditClick(item)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                <path
                                  fillRule="evenodd"
                                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
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
