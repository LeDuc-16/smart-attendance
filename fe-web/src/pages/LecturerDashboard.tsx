import HeaderLecturer from "../components/HeaderLecturer";
import SidebarLecturer from "../components/SidebarLecturer";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getSchedulesByLecturer } from "../api/apiTeaching";
import { getCourses } from "../api/apiCourse";
import { getClassRooms } from "../api/apiClassRoom";
import { getClasses } from "../api/apiClass";

function getTodayLabel() {
  const today = new Date();
  const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const dayOfWeek = days[today.getDay()];
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dayOfWeek} Ngày ${dd}/${mm}/${yyyy}`;
}

function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}


const LecturerDashboard = () => {
  const location = useLocation();
  let activeTab = "dashboard";
  if (location.pathname === "/teaching-schedule") activeTab = "teaching-schedule";
  else if (location.pathname === "/lecturer-reports") activeTab = "report";
  else if (location.pathname === "/lecturer-dashboard") activeTab = "dashboard";
  else if (location.pathname === "/attendance") activeTab = "attendance";
  const [scheduleToday, setScheduleToday] = useState<any[]>([]);
  const todayStr = getTodayString();

  useEffect(() => {
    (async () => {
      try {
        const schedules = await getSchedulesByLecturer();
        const coursesRes = await getCourses();
        const roomsRes = await getClassRooms();
        const classesRes = await getClasses();

        let courses: any[] = [];
        if (coursesRes && coursesRes.data) {
            if (Array.isArray(coursesRes.data)) {
                courses = coursesRes.data;
            } else if (Array.isArray(coursesRes.data.content)) {
                courses = coursesRes.data.content;
            }
        }

        let rooms: any[] = [];
        if (roomsRes && roomsRes.data) {
            if (Array.isArray(roomsRes.data)) {
                rooms = roomsRes.data;
            } else if (Array.isArray(roomsRes.data.content)) {
                rooms = roomsRes.data.content;
            }
        }
        
        let classes: any[] = [];
        if (classesRes && classesRes.data) {
            if (Array.isArray(classesRes.data)) {
                classes = classesRes.data;
            } else if (Array.isArray(classesRes.data.content)) {
                classes = classesRes.data.content;
            }
        }

        const enriched = schedules.flatMap((item: any) => {
          const course = courses.find((c: any) => c.courseName === item.courseName);
          const room = rooms.find((r: any) => r.roomCode === item.roomName);
          const classInfo = classes.find((cl: any) => cl.className === item.className);

          return item.weeks.flatMap((week: any) => {
            return week.studyDays.filter((day: any) => day.date === todayStr).map((day: any) => {
              // Xác định trạng thái
              const now = new Date();
              const [startHour, startMinute] = (item.startTime).split(':').map(Number);
              const [endHour, endMinute] = (item.endTime).split(':').map(Number);

              const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
              const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);

              let status = "Sắp tới";
              let statusType = "upcoming";
              if (now >= start && now <= end) {
                status = "Đang diễn ra";
                statusType = "active";
              } else if (now > end) {
                status = "Đã kết thúc";
                statusType = "ended";
              }

              function formatTime(str: string) {
                if (!str) return "";
                if (/^\d{2}:\d{2}$/.test(str)) return str;
                const d = new Date(str);
                if (isNaN(d.getTime())) return str;
                return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
              }

              return {
                subject: item.courseName || "",
                className: item.className || "",
                time: `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`,
                room: item.roomName || "",
                students: classInfo?.capacityStudent || "-",
                status,
                statusType,
              };
            });
          });
        });

        setScheduleToday(enriched);
      } catch(e) {
        console.error("Failed to fetch dashboard data", e);
        setScheduleToday([]);
      }
    })();
  }, [todayStr]);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar giảng viên */}
  <SidebarLecturer activeTab={activeTab} />

      {/* Main Content */}
  <div className="flex-1 flex flex-col font-sans font-normal">
        <HeaderLecturer lecturerName="Kiều Tuấn Dũng" />
        <main className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-700">Quản lý lịch giảng dạy và điểm danh sinh viên</h1>
            <p className="text-sm text-gray-500">Trường Đại học Thủy Lợi - Hệ thống điểm danh</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-blue-700">Lịch học hôm nay</h2>
                <p className="text-sm text-gray-500">{getTodayLabel()}</p>
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