import React, { useState, useEffect, useCallback } from "react";
import {
    FiEdit,
    FiTrash2,
    FiPlus,
    FiX,
    FiSearch,
    FiCalendar,
    FiDownload
} from "react-icons/fi";
import {
    getTeachingSchedules,
    getSchedulesByDate,
    createTeachingSchedule,
    updateTeachingSchedule,
    deleteTeachingSchedule,
    getAllCourses,
    getAllLecturers,
    getAllClassesForDropdown,
    getAllRooms,
    type TeachingSchedule,
    type TeachingSchedulePayload,
    type DropdownOption
} from "../api/apiTeaching";

// Danh sách thứ trong tuần
const DAYS_OF_WEEK = [
    { value: "MONDAY", label: "Thứ 2" },
    { value: "TUESDAY", label: "Thứ 3" },
    { value: "WEDNESDAY", label: "Thứ 4" },
    { value: "THURSDAY", label: "Thứ 5" },
    { value: "FRIDAY", label: "Thứ 6" },
    { value: "SATURDAY", label: "Thứ 7" },
    { value: "SUNDAY", label: "Chủ nhật" }
];

// Modal Form Component
const TeachingScheduleModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    courses,
    lecturers,
    classes,
    rooms
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TeachingSchedulePayload) => void;
    initialData: TeachingSchedule | null;
    courses: DropdownOption[];
    lecturers: DropdownOption[];
    classes: DropdownOption[];
    rooms: DropdownOption[];
}) => {
    const [formData, setFormData] = useState<TeachingSchedulePayload>({
        startDate: "",
        endDate: "",
        dayOfWeek: [],
        startTime: "",
        endTime: "",
        courseId: 0,
        lecturerId: 0,
        classId: 0,
        roomId: 0,
    });
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Khi edit, cần convert từ data response
                setFormData({
                    startDate: initialData.weeks[0]?.startDate || "",
                    endDate: initialData.weeks[initialData.weeks.length - 1]?.endDate || "",
                    dayOfWeek: initialData.weeks[0]?.studyDays.map(day => day.dayOfWeek) || [],
                    startTime: initialData.startTime,
                    endTime: initialData.endTime,
                    courseId: initialData.courseId,
                    lecturerId: initialData.lecturerId,
                    classId: initialData.classId,
                    roomId: initialData.roomId,
                });
            } else {
                setFormData({
                    startDate: "",
                    endDate: "",
                    dayOfWeek: [],
                    startTime: "",
                    endTime: "",
                    courseId: 0,
                    lecturerId: 0,
                    classId: 0,
                    roomId: 0,
                });
            }
            setFormError("");
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name.includes("Id") ? parseInt(value) || 0 : value
        }));
    };

    const handleDayOfWeekChange = (day: string) => {
        setFormData(prev => ({
            ...prev,
            dayOfWeek: prev.dayOfWeek.includes(day)
                ? prev.dayOfWeek.filter(d => d !== day)
                : [...prev.dayOfWeek, day]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Thêm :00 vào cuối nếu chỉ có HH:mm
        const formatTime = (time: string) => {
            if (time && time.length === 5) { // HH:mm format
                return time + ':00'; // Convert to HH:mm:ss
            }
            return time;
        };

        const formattedData = {
            ...formData,
            startTime: formatTime(formData.startTime),
            endTime: formatTime(formData.endTime)
        };

        onSubmit(formattedData);
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start p-4">
                    <div>
                        <h3 className="text-xl font-semibold">
                            {initialData ? 'Chỉnh sửa lịch giảng dạy' : 'Thêm lịch giảng dạy mới'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Thêm thông tin lịch giảng dạy mới.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Ngày bắt đầu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày bắt đầu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Ngày kết thúc */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày kết thúc <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Thời gian bắt đầu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thời gian bắt đầu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Thời gian kết thúc */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thời gian kết thúc <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Môn học */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Môn học <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="courseId"
                                    value={formData.courseId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={0}>-- Chọn môn học --</option>
                                    {courses.map((course) => (
                                        <option key={course.value} value={course.value}>
                                            {course.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Giảng viên */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giảng viên <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="lecturerId"
                                    value={formData.lecturerId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={0}>-- Chọn giảng viên --</option>
                                    {lecturers.map((lecturer) => (
                                        <option key={lecturer.value} value={lecturer.value}>
                                            {lecturer.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Lớp học */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lớp học <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="classId"
                                    value={formData.classId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={0}>-- Chọn lớp học --</option>
                                    {classes.map((classItem) => (
                                        <option key={classItem.value} value={classItem.value}>
                                            {classItem.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Phòng học */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phòng học <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="roomId"
                                    value={formData.roomId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={0}>-- Chọn phòng học --</option>
                                    {rooms.map((room) => (
                                        <option key={room.value} value={room.value}>
                                            {room.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Ngày trong tuần */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày trong tuần <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {DAYS_OF_WEEK.map((day) => (
                                    <label key={day.value} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.dayOfWeek.includes(day.value)}
                                            onChange={() => handleDayOfWeekChange(day.value)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">{day.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {formError && <p className="text-red-500 text-sm mt-4">{formError}</p>}
                    </div>
                    <div className="flex justify-end p-4 border-t">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                        >
                            {initialData ? 'Lưu thay đổi' : 'Thêm lịch giảng dạy'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main TeachingPage Component
const TeachingPage = () => {
    const [schedules, setSchedules] = useState<TeachingSchedule[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Dropdown options
    const [courses, setCourses] = useState<DropdownOption[]>([]);
    const [lecturers, setLecturers] = useState<DropdownOption[]>([]);
    const [classes, setClasses] = useState<DropdownOption[]>([]);
    const [rooms, setRooms] = useState<DropdownOption[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<TeachingSchedule | null>(null);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredSchedules, setFilteredSchedules] = useState<any[]>([]);

    // Fetch dropdown options
    const fetchDropdownOptions = useCallback(async () => {
        try {
            const [coursesData, lecturersData, classesData, roomsData] = await Promise.all([
                getAllCourses(),
                getAllLecturers(),
                getAllClassesForDropdown(),
                getAllRooms()
            ]);
            setCourses(coursesData);
            setLecturers(lecturersData);
            setClasses(classesData);
            setRooms(roomsData);
        } catch (err) {
            console.error("Error fetching dropdown options:", err);
        }
    }, []);

    // Fetch schedules by date
    const fetchSchedulesByDate = useCallback(async (date: string) => {
        setLoading(true);
        setError(null);
        try {
            let data: TeachingSchedule[];

            // Thử gọi API theo date trước, nếu lỗi thì gọi API lấy tất cả
            try {
                data = await getSchedulesByDate(date);
            } catch (dateApiError) {
                console.log('Date API failed, fallback to get all schedules');
                const allSchedules = await getTeachingSchedules();
                // Filter schedules có chứa ngày được chọn
                data = allSchedules.filter(schedule =>
                    schedule.weeks.some(week =>
                        week.studyDays.some(day => day.date === date)
                    )
                );
            }

            // Flatten data để hiển thị trong bảng
            const flattenedData: any[] = [];
            data.forEach(schedule => {
                schedule.weeks.forEach(week => {
                    week.studyDays.forEach(day => {
                        if (day.date === date) {
                            flattenedData.push({
                                id: `${schedule.id}-${week.weekNumber}-${day.dayOfWeek}`,
                                scheduleId: schedule.id,
                                startTime: schedule.startTime,
                                endTime: schedule.endTime,
                                courseId: schedule.courseId,
                                courseName: courses.find(c => c.value === schedule.courseId)?.label || `Course ${schedule.courseId}`,
                                lecturerId: schedule.lecturerId,
                                lecturerName: lecturers.find(l => l.value === schedule.lecturerId)?.label || `Lecturer ${schedule.lecturerId}`,
                                classId: schedule.classId,
                                className: classes.find(c => c.value === schedule.classId)?.label || `Class ${schedule.classId}`,
                                roomId: schedule.roomId,
                                roomCode: rooms.find(r => r.value === schedule.roomId)?.label || `Room ${schedule.roomId}`,
                                date: day.date,
                                dayOfWeek: day.dayOfWeek,
                                weekNumber: week.weekNumber
                            });
                        }
                    });
                });
            });

            // Filter by search term
            let filtered = flattenedData;
            if (searchTerm) {
                filtered = flattenedData.filter(item =>
                    item.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.lecturerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.roomCode?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            setFilteredSchedules(filtered);
            setSchedules(data);
        } catch (err) {
            console.error(err);
            setError("Không tải được lịch giảng dạy.");
            setFilteredSchedules([]);
        } finally {
            setLoading(false);
        }
    }, [courses, lecturers, classes, rooms, searchTerm]);


    useEffect(() => {
        fetchDropdownOptions();
    }, [fetchDropdownOptions]);

    useEffect(() => {
        if (courses.length > 0 && lecturers.length > 0 && classes.length > 0 && rooms.length > 0) {
            fetchSchedulesByDate(selectedDate);
        }
    }, [selectedDate, fetchSchedulesByDate, courses, lecturers, classes, rooms]);

    const openAddModal = () => {
        setEditingSchedule(null);
        setIsModalOpen(true);
    };

    const openEditModal = (schedule: TeachingSchedule) => {
        setEditingSchedule(schedule);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: TeachingSchedulePayload) => {
        try {
            if (editingSchedule) {
                await updateTeachingSchedule(editingSchedule.id, data);
                alert('Cập nhật lịch giảng dạy thành công!');
            } else {
                await createTeachingSchedule(data);
                alert('Thêm lịch giảng dạy thành công!');
            }
            setIsModalOpen(false);
            fetchSchedulesByDate(selectedDate);
        } catch (error: any) {
            console.error("API Error:", error);
            const errorMessage = error.response?.data?.message || "Không thể thực hiện thao tác.";
            alert(`Lỗi: ${errorMessage}`);
        }
    };

    const handleDeleteSchedule = async (scheduleId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lịch giảng dạy này không?')) {
            try {
                await deleteTeachingSchedule(scheduleId);
                alert('Xóa lịch giảng dạy thành công!');
                fetchSchedulesByDate(selectedDate);
            } catch (error) {
                alert('Lỗi: Không thể xóa lịch giảng dạy.');
                console.error(error);
            }
        }
    };

    const formatDateVietnamese = (dateString: string) => {
        const date = new Date(dateString);
        return `Thứ ${date.getDay() === 0 ? 'Chủ nhật' : date.getDay() + 1}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    return (
        <>
            <TeachingScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingSchedule}
                courses={courses}
                lecturers={lecturers}
                classes={classes}
                rooms={rooms}
            />

            <div className="space-y-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">
                        Quản lý lịch giảng dạy
                    </h1>
                    <p className="text-[#717182] text-xl">
                        Quản lý thông tin lịch giảng dạy trong Trường Đại Học Thủy Lợi
                    </p>
                </div>

                {/* Filter Section */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo môn học, phòng, giảng viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Chọn ngày:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            onClick={openAddModal}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center font-semibold text-sm"
                        >
                            <FiPlus className="mr-2" />
                            Thêm lịch giảng dạy
                        </button>
                    </div>
                </div>

                {/* Schedule Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-700">
                            Thông kê lịch giảng dạy - {formatDateVietnamese(selectedDate)}
                        </h2>
                    </div>

                    {loading ? (
                        <p className="p-6 text-center text-gray-500">Đang tải dữ liệu...</p>
                    ) : error ? (
                        <p className="p-6 text-center text-red-600">{error}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            STT
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thời gian bắt đầu
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thời gian kết thúc
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Môn học
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phòng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Giảng viên
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSchedules.length > 0 ? (
                                        filteredSchedules.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {item.startTime}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {item.endTime}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {item.courseName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {item.roomCode}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {item.lecturerName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-4">
                                                        <button
                                                            onClick={() => {
                                                                const schedule = schedules.find(s => s.id === item.scheduleId);
                                                                if (schedule) openEditModal(schedule);
                                                            }}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Sửa"
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSchedule(item.scheduleId)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Xóa"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center py-6 text-gray-500">
                                                Hiện tại {selectedDate} - {formatDateVietnamese(selectedDate)} chưa có lịch giảng dạy nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredSchedules.length > 0 && (
                        <div className="px-4 py-3 text-sm text-gray-600 border-t">
                            Hiển thị 1 - {filteredSchedules.length} của {filteredSchedules.length} lịch giảng dạy
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TeachingPage;
