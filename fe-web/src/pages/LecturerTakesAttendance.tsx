import SidebarLecturer from "../components/SidebarLecturer";
import HeaderLecturer from "../components/HeaderLecturer";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getSchedulesByLecturerId } from "../api/apiTeaching";
import { getCourses } from "../api/apiCourse";
import { getClassRooms } from "../api/apiClassRoom";
import { getClasses } from "../api/apiClass";

const LecturerTakesAttendance = () => {
  const location = useLocation();
  let activeTab = "attendance";
  if (location.pathname === "/teaching-schedule") activeTab = "teaching-schedule";
  else if (location.pathname === "/lecturer-reports") activeTab = "report";
  else if (location.pathname === "/lecturer-dashboard") activeTab = "dashboard";
  else if (location.pathname === "/attendance") activeTab = "attendance";

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const [date, setDate] = useState(`${yyyy}-${mm}-${dd}`);
  // Lấy dữ liệu từ API giống như trang lịch giảng dạy
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
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

  // Hàm cập nhật trạng thái điểm danh khi có kết quả từ API xác thực khuôn mặt
  // Gọi hàm này khi nhận được response từ /api/v1/student-faces/compare
  const markStudentPresent = (studentId: number) => {
    setStudentStatus((prev: {[id: number]: 'present'|'late'}) => ({ ...prev, [studentId]: 'present' }));
    // Debug: expose to window for manual triggering
    (window as any).markStudentPresent = markStudentPresent;
  };
  // Ví dụ: gọi hàm này sau khi sinh viên điểm danh thành công
  // Khi nhận response từ API:
  // const response = { data: { studentId: 4, ... } };
  // markStudentPresent(response.data.studentId);
  useEffect(() => {
    if (currentLecturerId === null) return;
    (async () => {
      try {
        const schedules = await getSchedulesByLecturerId(currentLecturerId);
        const coursesRes = await getCourses();
        const rooms = await getClassRooms();
        const classesRes = await getClasses();

        const courses: any[] = (coursesRes as any).data;
        const classes: any[] = (classesRes as any).data;

        const filteredSchedules = schedules.flatMap((item: any) => {
          const course = courses.find((c: any) => c.id === item.courseId);
          const room = rooms.find((r: any) => r.id === item.roomId);
          const classInfo = classes.find((cl: any) => cl.id === item.classId);

          return item.weeks.flatMap((week: any) => {
            return week.studyDays.filter((day: any) => day.date === date).map((day: any) => {
              return {
                subject: course?.courseName || "",
                className: classInfo?.className || "",
                time: `${formatTime(day.startTime || item.startTime)} - ${formatTime(day.endTime || item.endTime)}`,
                room: room?.roomCode || "",
                students: classInfo?.capacityStudent ?? "-",
                status: "Sắp tới", // Có thể cập nhật trạng thái thực tế nếu có
                statusType: "upcoming", // Có thể cập nhật trạng thái thực tế nếu có
              };
            });
          });
        });

        setAttendanceList(filteredSchedules);
      } catch (err) {
        setAttendanceList([]);
      }
    })();
  }, [date, currentLecturerId]);

  function formatTime(str: string) {
    if (!str) return "";
    if (/^\d{2}:\d{2}$/.test(str)) return str;
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  // State cho giao diện điểm danh
  const [attendanceMode, setAttendanceMode] = useState(false);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 12;
  // Trạng thái điểm danh mẫu
  const [studentStatus, setStudentStatus] = useState<{[id: number]: 'present'|'late'}>({});

  // Fetch students by className
  const handleStartAttendance = async (className: string, subject: string) => {
    setSelectedClass(className);
    setSelectedSubject(subject);
    try {
      const students = await import('../api/apiStudent').then(m => m.getStudents());
      // Sửa filter: loại bỏ khoảng trắng, ký tự thừa, kiểm tra dữ liệu đầu vào
      const normalizedClassName = className.trim().toLowerCase();
      const filtered = students.filter((stu: any) => {
        if (!stu.className) return false;
        return stu.className.trim().toLowerCase() === normalizedClassName;
      });
      console.log('ClassName truyền vào:', className);
      console.log('Danh sách sinh viên:', students);
      console.log('Danh sách sinh viên filter:', filtered);
      setStudentList(filtered);
      // Khởi tạo trạng thái điểm danh mặc định là 'late' cho tất cả
      const statusObj: {[id: number]: 'present'|'late'} = {};
      filtered.forEach((stu: any) => {
        statusObj[stu.id] = 'late';
      });
      setStudentStatus(statusObj);
      setAttendanceMode(true);
      setCurrentPage(1);
    } catch (err) {
      setStudentList([]);
      setAttendanceMode(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <SidebarLecturer activeTab={activeTab} />
      <div className="flex-1 flex flex-col">
        <HeaderLecturer lecturerName="Kiều Tuấn Dũng" />
        <main className="flex-1 p-8 overflow-y-auto">
          {!attendanceMode ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-blue-800">Điểm danh sinh viên</h1>
                <p className="text-sm text-gray-500">
                  Khởi tạo và quản lý các buổi điểm danh bằng nhận diện khuôn mặt
                </p>
              </div>
              <div className="bg-white rounded-lg border border-blue-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-blue-800 mb-1">Quản lý điểm danh</h2>
                    <p className="text-sm text-gray-500">
                      Quản lý điểm danh ngày {new Date(date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <input
                      type="date"
                      className="border rounded px-4 py-2 text-gray-700"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-blue-50 text-gray-600">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Môn học</th>
                        <th className="py-3 px-4 font-semibold">Tên lớp</th>
                        <th className="py-3 px-4 font-semibold">Thời gian</th>
                        <th className="py-3 px-4 font-semibold">Phòng</th>
                        <th className="py-3 px-4 font-semibold">Sinh viên</th>
                        <th className="py-3 px-4 font-semibold">Trạng thái</th>
                        <th className="py-3 px-4 font-semibold text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {attendanceList.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                          <td className="py-3 px-4">{item.subject}</td>
                          <td className="py-3 px-4">{item.className}</td>
                          <td className="py-3 px-4">{item.time}</td>
                          <td className="py-3 px-4">{item.room}</td>
                          <td className="py-3 px-4">{item.students}</td>
                          <td className="py-3 px-4">
                            {item.statusType === "active" ? (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                {item.status}
                              </span>
                            ) : (
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                {item.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center align-middle">
                            <div className="flex justify-center items-center h-full">
                              <button className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleStartAttendance(item.className, item.subject)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                                Bắt đầu điểm danh
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border border-blue-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-blue-800">Danh sách sinh viên</h2>
                  <p className="text-sm text-gray-500">Trạng thái sinh viên điểm danh lớp {selectedClass} - Môn {selectedSubject}</p>
                </div>
                <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => setAttendanceMode(false)}>Quay lại</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {studentList.slice((currentPage-1)*studentsPerPage, currentPage*studentsPerPage).map((stu) => (
                  <div key={stu.id} className="border rounded-lg flex items-center gap-4 p-4 bg-white shadow-sm">
                    <img src={stu.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="font-semibold text-base text-gray-800">{stu.studentName}</div>
                      <div className="text-sm text-gray-500">MSV: {stu.studentCode}</div>
                    </div>
                    {studentStatus[stu.id] === 'present' ? (
                      <span className="px-4 py-2 rounded bg-green-100 text-green-700 font-semibold text-sm">Có mặt</span>
                    ) : (
                      <span className="px-4 py-2 rounded bg-yellow-100 text-yellow-700 font-semibold text-sm">Muộn</span>
                    )}
                  </div>
                ))}
              </div>
              {/* Pagination */}
              <div className="flex justify-end items-center gap-2 mt-6">
                <button className="px-2 py-1 border rounded" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}>&lt; Trước</button>
                {[...Array(Math.ceil(studentList.length/studentsPerPage)).keys()].map(i => (
                  <button key={i} className={`px-3 py-1 border rounded ${currentPage === i+1 ? 'bg-blue-600 text-white' : ''}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                ))}
                <button className="px-2 py-1 border rounded" disabled={currentPage === Math.ceil(studentList.length/studentsPerPage)} onClick={() => setCurrentPage(p => p+1)}>Tiếp &gt;</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LecturerTakesAttendance;