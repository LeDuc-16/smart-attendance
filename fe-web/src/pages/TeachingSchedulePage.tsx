import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  let activeTab = "teaching-schedule";
  if (location.pathname === "/teaching-schedule") activeTab = "teaching-schedule";
  else if (location.pathname === "/lecturer-reports") activeTab = "report";
  else if (location.pathname === "/lecturer-dashboard") activeTab = "dashboard";
  else if (location.pathname === "/attendance") activeTab = "attendance";

  const [currentLecturerId, setCurrentLecturerId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.id) {
          setCurrentLecturerId(user.id);
        }
      }
    } catch (error) {
      console.error("Failed to get user data from local storage", error);
    }
  }, []);

  // Hàm lấy ngày đầu tuần (Thứ 2) từ một ngày bất kỳ
  function getMonday(d: Date) {
    const day = d.getDay();
    // Tính toán số ngày cần trừ để về thứ 2
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    return monday;
  }

  // Hàm lấy danh sách ngày trong tuần
  function getWeekDates(date: string) {
    const d = new Date(date + 'T00:00:00');
    const monday = getMonday(d);
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const yyyy = day.getFullYear();
      const mm = String(day.getMonth() + 1).padStart(2, "0");
      const dd = String(day.getDate()).padStart(2, "0");
      weekDates.push(`${yyyy}-${mm}-${dd}`);
    }
    return weekDates;
  }

  function getTodayString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const [date, setDate] = useState(getTodayString());
  const [scheduleData, setScheduleData] = useState<TeachingSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekDates, setWeekDates] = useState<string[]>(
    getWeekDates(getTodayString())
  );

  function getWeekStringForInput(d: string): string {
    if (!d) return "";
    const [year, month, day] = d.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      (((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
    );
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  }

  useEffect(() => {
    setWeekDates(getWeekDates(date));
  }, [date]);

  useEffect(() => {
    if (weekDates.length === 0 || currentLecturerId === null) return;
    setLoading(true);
    (async () => {
      try {
        const dailySchedulesPromises = weekDates.map(d => getSchedulesByDate(d));
        const dailySchedules = await Promise.all(dailySchedulesPromises);

        const allSchedules = dailySchedules.flat();
        const uniqueSchedules = Array.from(new Map(allSchedules.map(item => [item.id, item])).values());

        const coursesRes = await getCourses();
        const rooms = await getClassRooms();
        const classesRes = await getClasses();

        const courses: any[] = (coursesRes as any).data;
        const classes: any[] = (classesRes as any).data;

        const schedulesForCurrentLecturer = uniqueSchedules.filter(
          (schedule: any) => schedule.lecturerId === currentLecturerId
        );

        let enriched: any[] = [];
        schedulesForCurrentLecturer.forEach((item: any) => {
          const course = courses.find((c: any) => c.id === item.courseId);
          const room = rooms.find((r: any) => r.id === item.roomId);
          const classInfo = classes.find((cl: any) => cl.id === item.classId);

          item.weeks.forEach((week: any) => {
            const weekStartStr = week.startDate;
            const weekEndStr = week.endDate;
            const currentWeekStartStr = weekDates[0];
            const currentWeekEndStr = weekDates[6];

            if (weekStartStr <= currentWeekEndStr && weekEndStr >= currentWeekStartStr) {
              week.studyDays.forEach((day: any) => {
                if (weekDates.includes(day.date)) {
                  enriched.push({
                    ...item,
                    date: day.date,
                    dayOfWeek: day.dayOfWeek,
                    courseName: course?.courseName || "",
                    className: classInfo?.className || "",
                    startTime: day.startTime || item.startTime,
                    endTime: day.endTime || item.endTime,
                    roomCode: room?.roomCode || "",
                    capacityStudent: classInfo?.capacityStudent,
                    raw: item,
                  });
                }
              });
            }
          });
        });

        const finalData = search
          ? enriched.filter(item =>
              item.courseName.toLowerCase().includes(search.toLowerCase()) ||
              item.className.toLowerCase().includes(search.toLowerCase()) ||
              item.roomCode.toLowerCase().includes(search.toLowerCase())
            )
          : enriched;

        setScheduleData(finalData);
      } catch (err) {
        console.error("Failed to fetch schedule data:", err);
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [weekDates, currentLecturerId, search]);

  const handleEditClick = (item: any) => {
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
      <SidebarLecturer activeTab={activeTab} />
      <div className="flex-1 flex flex-col">
        <HeaderLecturer lecturerName="Kiều Tuấn Dũng" />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-700">Lịch giảng dạy</h1>
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
            <div className="relative w-full md:w-auto flex gap-2 items-center">
              <input
                type="week"
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={getWeekStringForInput(date)}
                onChange={(e) => {
                  // Lấy ngày đầu tuần từ input type="week" (YYYY-Wxx)
                  const [year, week] = e.target.value.split("-W");
                  function getMondayOfWeek(year: number, week: number) {
                    const simple = new Date(year, 0, 1 + (week - 1) * 7);
                    const dow = simple.getDay();
                    const monday = simple;
                    if (dow <= 4)
                      monday.setDate(simple.getDate() - simple.getDay() + 1);
                    else
                      monday.setDate(simple.getDate() + 8 - simple.getDay());
                    return monday;
                  }
                  const monday = getMondayOfWeek(Number(year), Number(week));
                  const yyyy = monday.getFullYear();
                  const mm = String(monday.getMonth() + 1).padStart(2, "0");
                  const dd = String(monday.getDate()).padStart(2, "0");
                  setDate(`${yyyy}-${mm}-${dd}`);
                }}
              />
              <span className="text-sm text-gray-500">
                Tuần: {weekDates[0]} - {weekDates[6]}
              </span>
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
                    <th className="py-3 px-4 font-semibold">Ngày</th>
                    <th className="py-3 px-4 font-semibold">Thứ</th>
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
                      <td colSpan={8} className="text-center py-6">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : scheduleData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-6">
                        Không có dữ liệu lịch giảng dạy cho tuần này
                      </td>
                    </tr>
                  ) : (
                    weekDates.map((dateStr) => {
                      // Lấy tất cả lịch học của ngày này
                      const items = scheduleData.filter(
                        (item: any) => item.date === dateStr
                      );
                      if (items.length === 0) {
                        return (
                          <tr
                            key={dateStr}
                            className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              {new Date(
                                dateStr + "T00:00:00"
                              ).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="py-3 px-4">
                              {(() => {
                                const day = new Date(
                                  dateStr + "T00:00:00"
                                ).getDay();
                                const days = [
                                  "Chủ nhật",
                                  "Thứ 2",
                                  "Thứ 3",
                                  "Thứ 4",
                                  "Thứ 5",
                                  "Thứ 6",
                                  "Thứ 7",
                                ];
                                return days[day];
                              })()}
                            </td>
                            <td
                              className="py-3 px-4 text-gray-400"
                              colSpan={6}
                            >
                              Không có lịch học
                            </td>
                          </tr>
                        );
                      }
                      return items.map((item: any, subIdx: number) => (
                        <tr
                          key={dateStr + "-" + subIdx}
                          className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            {new Date(
                              item.date + "T00:00:00"
                            ).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="py-3 px-4">
                            {(() => {
                              const dayMap: Record<string, string> = {
                                MONDAY: "Thứ 2",
                                TUESDAY: "Thứ 3",
                                WEDNESDAY: "Thứ 4",
                                THURSDAY: "Thứ 5",
                                FRIDAY: "Thứ 6",
                                SATURDAY: "Thứ 7",
                                SUNDAY: "Chủ nhật",
                              };
                              return dayMap[item.dayOfWeek] || "";
                            })()}
                          </td>
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
                      ));
                    })
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