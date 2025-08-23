import React, { useState, useEffect, useCallback } from "react";
import {
    FiEdit,
    FiTrash2,
    FiPlus,
    FiX,
    FiSearch,
} from "react-icons/fi";
import {
    getTeachingSchedules,
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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DAYS_OF_WEEK = [
    { value: "MONDAY", label: "Thứ 2" },
    { value: "TUESDAY", label: "Thứ 3" },
    { value: "WEDNESDAY", label: "Thứ 4" },
    { value: "THURSDAY", label: "Thứ 5" },
    { value: "FRIDAY", label: "Thứ 6" },
    { value: "SATURDAY", label: "Thứ 7" },
    { value: "SUNDAY", label: "Chủ nhật" }
];

const validateScheduleData = (formData: TeachingSchedulePayload): string[] => {
    const errors: string[] = [];

    const timeToMinutes = (time: string): number => {
        if (!time) return 0;
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // 1. Ngày kết thúc >= ngày bắt đầu
    if (formData.startDate && formData.endDate) {
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        if (endDate < startDate) {
            errors.push("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");
        }
    }

    // 2. Thời gian trong khoảng 07:00 - 21:30
    const MIN_TIME = 7 * 60;
    const MAX_TIME = 21 * 60 + 30;

    if (formData.startTime) {
        const startMinutes = timeToMinutes(formData.startTime);
        if (startMinutes < MIN_TIME || startMinutes > MAX_TIME) {
            errors.push("Thời gian bắt đầu phải nằm trong khoảng 07:00 đến 21:30.");
        }
    }

    if (formData.endTime) {
        const endMinutes = timeToMinutes(formData.endTime);
        if (endMinutes < MIN_TIME || endMinutes > MAX_TIME) {
            errors.push("Thời gian kết thúc phải nằm trong khoảng 07:00 đến 21:30.");
        }
    }

    // 3. Thời gian kết thúc > thời gian bắt đầu
    if (formData.startTime && formData.endTime) {
        const startMinutes = timeToMinutes(formData.startTime);
        const endMinutes = timeToMinutes(formData.endTime);
        if (endMinutes <= startMinutes) {
            errors.push("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
        }
    }

    return errors;
};

const checkScheduleConflict = (newSchedule: TeachingSchedulePayload, existingSchedules: any[]): string[] => {
    const conflicts: string[] = [];

    const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const newStartMinutes = timeToMinutes(newSchedule.startTime.substring(0, 5));
    const newEndMinutes = timeToMinutes(newSchedule.endTime.substring(0, 5));

    newSchedule.dayOfWeek.forEach(dayOfWeek => {
        existingSchedules.forEach(existing => {
            if (existing.dayOfWeek !== dayOfWeek) return;

            const existingStartMinutes = timeToMinutes(existing.startTime.substring(0, 5));
            const existingEndMinutes = timeToMinutes(existing.endTime.substring(0, 5));


            const hasTimeOverlap = (newStartMinutes < existingEndMinutes) && (existingStartMinutes < newEndMinutes);

            if (!hasTimeOverlap) return;

            const dayLabel = DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || dayOfWeek;

            if (existing.lecturerId === newSchedule.lecturerId) {
                conflicts.push(`Giảng viên đã có lịch dạy vào ${dayLabel} từ ${existing.startTime} đến ${existing.endTime}`);
            }

            if (existing.roomId === newSchedule.roomId) {
                conflicts.push(`Phòng ${existing.roomCode} đã được sử dụng vào ${dayLabel} từ ${existing.startTime} đến ${existing.endTime}`);
            }

            if (existing.classId === newSchedule.classId) {
                conflicts.push(`Lớp ${existing.className} đã có lịch học vào ${dayLabel} từ ${existing.startTime} đến ${existing.endTime}`);
            }
        });
    });

    return [...new Set(conflicts)];
};

const TeachingScheduleModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    courses,
    lecturers,
    classes,
    rooms,
    formError
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TeachingSchedulePayload) => void;
    initialData: TeachingSchedule | null;
    courses: DropdownOption[];
    lecturers: DropdownOption[];
    classes: DropdownOption[];
    rooms: DropdownOption[];
    formError?: string;
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
    const [inputError, setInputError] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    startDate: initialData.weeks[0]?.startDate || "",
                    endDate: initialData.weeks[initialData.weeks.length - 1]?.endDate || "",
                    dayOfWeek: initialData.weeks[0]?.studyDays.map(day => day.dayOfWeek) || [],
                    startTime: initialData.startTime.substring(0, 5),
                    endTime: initialData.endTime.substring(0, 5),
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
            setInputError("");
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name.includes("Id") ? parseInt(value) || 0 : value
        }));
        setInputError("");
    };

    const handleDayOfWeekChange = (day: string) => {
        setFormData(prev => ({
            ...prev,
            dayOfWeek: prev.dayOfWeek.includes(day)
                ? prev.dayOfWeek.filter(d => d !== day)
                : [...prev.dayOfWeek, day]
        }));
        setInputError("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.startDate) {
            setInputError("Vui lòng chọn ngày bắt đầu.");
            return;
        }
        if (!formData.endDate) {
            setInputError("Vui lòng chọn ngày kết thúc.");
            return;
        }
        if (!formData.startTime) {
            setInputError("Vui lòng chọn thời gian bắt đầu.");
            return;
        }
        if (!formData.endTime) {
            setInputError("Vui lòng chọn thời gian kết thúc.");
            return;
        }
        if (formData.dayOfWeek.length === 0) {
            setInputError("Vui lòng chọn ít nhất một ngày trong tuần.");
            return;
        }
        if (!formData.courseId) {
            setInputError("Vui lòng chọn môn học.");
            return;
        }
        if (!formData.lecturerId) {
            setInputError("Vui lòng chọn giảng viên.");
            return;
        }
        if (!formData.classId) {
            setInputError("Vui lòng chọn lớp học.");
            return;
        }
        if (!formData.roomId) {
            setInputError("Vui lòng chọn phòng học.");
            return;
        }

        const validationErrors = validateScheduleData(formData);
        if (validationErrors.length > 0) {
            setInputError(validationErrors[0]);
            return;
        }

        const formatTime = (time: string) => {
            if (time && time.length === 5) {
                return time + ':00';
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
                        <h3 className="text-xl font-semibold text-[#1E3A8A]">
                            {initialData ? 'Chỉnh sửa lịch giảng dạy' : 'Thêm mới'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {initialData
                                ? 'Sửa thông tin lịch giảng dạy.'
                                : 'Thêm thông tin lịch giảng dạy mới.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                            <h4 className="font-semibold">Thông tin lịch giảng dạy</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày bắt đầu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày kết thúc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        min={formData.startDate}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Thời gian bắt đầu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        min="07:00"
                                        max="21:30"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Chỉ trong khoảng 07:00 - 21:30</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Thời gian kết thúc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        min="07:00"
                                        max="21:30"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Chỉ trong khoảng 07:00 - 21:30</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Môn học <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="courseId"
                                        value={formData.courseId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={0}>-- Chọn môn học --</option>
                                        {courses.map((course) => (
                                            <option key={course.value} value={course.value}>
                                                {course.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Giảng viên <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="lecturerId"
                                        value={formData.lecturerId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={0}>-- Chọn giảng viên --</option>
                                        {lecturers.map((lecturer) => (
                                            <option key={lecturer.value} value={lecturer.value}>
                                                {lecturer.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lớp học <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={0}>-- Chọn lớp học --</option>
                                        {classes.map((classItem) => (
                                            <option key={classItem.value} value={classItem.value}>
                                                {classItem.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phòng học <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="roomId"
                                        value={formData.roomId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

                            {(inputError || formError) && (
                                <p className="text-red-500 text-sm mt-2">{inputError || formError}</p>
                            )}
                        </div>
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

const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    scheduleName,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    scheduleName: string;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-60">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-0">
                <div className="flex items-start justify-between px-6 pt-6">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa lịch giảng dạy</h2>
                            <div className="text-gray-400 text-base font-medium">Hành động không thể hoàn tác</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                        <FiX size={24} />
                    </button>
                </div>
                <div className="px-6 pb-0 pt-4">
                    <span className="text-base text-gray-500">
                        Bạn có chắc chắn muốn xóa lịch giảng dạy <span className="font-bold text-black">{scheduleName}</span> khỏi hệ thống?
                    </span>
                </div>
                <div className="flex items-center justify-end gap-6 px-6 pb-6 pt-6">
                    <button
                        className="rounded-lg border border-gray-400 px-6 py-2 text-black font-semibold text-lg transition hover:bg-gray-100"
                        onClick={onClose}
                        type="button"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-lg bg-red-500 px-6 py-2 font-semibold text-white text-lg transition hover:bg-red-600"
                        type="button"
                    >
                        Xóa lịch giảng dạy
                    </button>
                </div>
            </div>
        </div>
    );
};

const TeachingPage = () => {
    const [schedules, setSchedules] = useState<TeachingSchedule[]>([]);
    const [allSchedulesForConflictCheck, setAllSchedulesForConflictCheck] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [courses, setCourses] = useState<DropdownOption[]>([]);
    const [lecturers, setLecturers] = useState<DropdownOption[]>([]);
    const [classes, setClasses] = useState<DropdownOption[]>([]);
    const [rooms, setRooms] = useState<DropdownOption[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<TeachingSchedule | null>(null);
    const [modalError, setModalError] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingSchedule, setDeletingSchedule] = useState<any>(null);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredSchedules, setFilteredSchedules] = useState<any[]>([]);

    const showSuccessToast = (message: string) => {
        toast.success(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    const showErrorToast = (message: string) => {
        toast.error(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

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

    const fetchSchedulesByDate = useCallback(async (date: string) => {
        setLoading(true);
        setError(null);
        try {
            let data: TeachingSchedule[];

            try {
                const allSchedules = await getTeachingSchedules();
                data = allSchedules;
            } catch (dateApiError) {
                console.log('Error fetching all schedules:', dateApiError);
                data = [];
            }

            const flattenedData: any[] = [];
            const allFlattenedData: any[] = [];

            data.forEach(schedule => {
                schedule.weeks.forEach(week => {
                    week.studyDays.forEach(day => {
                        const scheduleItem = {
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
                        };

                        allFlattenedData.push(scheduleItem);

                        if (day.date === date) {
                            flattenedData.push(scheduleItem);
                        }
                    });
                });
            });

            setSchedules(data);
            setAllSchedulesForConflictCheck(allFlattenedData);

            let filtered = flattenedData;
            if (searchTerm) {
                filtered = flattenedData.filter(item =>
                    item.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.lecturerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.roomCode?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            setFilteredSchedules(filtered);

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
        setModalError('');
        setIsModalOpen(true);
    };

    const openEditModal = (schedule: TeachingSchedule) => {
        setEditingSchedule(schedule);
        setModalError('');
        setIsModalOpen(true);
    };

    const openDeleteModal = (scheduleItem: any) => {
        setDeletingSchedule(scheduleItem);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletingSchedule(null);
        setIsDeleteModalOpen(false);
    };

    const handleFormSubmit = async (data: TeachingSchedulePayload) => {
        setModalError('');
        const conflictErrors = checkScheduleConflict(data, allSchedulesForConflictCheck);
        if (conflictErrors.length > 0) {
            setModalError(conflictErrors[0]);
            return;
        }

        try {
            if (editingSchedule) {
                await updateTeachingSchedule(editingSchedule.id, data);
                showSuccessToast('Cập nhật lịch giảng dạy thành công!');
            } else {
                await createTeachingSchedule(data);
                showSuccessToast('Thêm lịch giảng dạy thành công!');
            }
            setIsModalOpen(false);
            fetchSchedulesByDate(selectedDate);
        } catch (error: any) {
            console.error("API Error:", error);
            const serverMessage = error.response?.data?.message || '';

            if (serverMessage.toLowerCase().includes('conflict') ||
                serverMessage.toLowerCase().includes('trùng lịch') ||
                serverMessage.toLowerCase().includes('duplicate')) {
                setModalError('Trùng lịch giảng dạy, vui lòng chọn thời gian khác');
            } else {
                setModalError(serverMessage || 'Có lỗi xảy ra, vui lòng thử lại');
            }
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingSchedule) return;

        try {
            await deleteTeachingSchedule(deletingSchedule.scheduleId);
            showSuccessToast('Xóa lịch giảng dạy thành công!');
            closeDeleteModal();
            fetchSchedulesByDate(selectedDate);
        } catch (error) {
            showErrorToast('Lỗi: Không thể xóa lịch giảng dạy.');
            console.error(error);
            closeDeleteModal();
        }
    };

    const formatDateVietnamese = (dateString: string) => {
        const date = new Date(dateString);
        const dayOfWeek = date.getDay();
        const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return `${dayNames[dayOfWeek]}, ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
    };

    return (
        <>
            <ToastContainer />
            <TeachingScheduleModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setModalError('');
                }}
                onSubmit={handleFormSubmit}
                initialData={editingSchedule}
                courses={courses}
                lecturers={lecturers}
                classes={classes}
                rooms={rooms}
                formError={modalError}
            />
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                scheduleName={deletingSchedule ? `${deletingSchedule.courseName} - ${deletingSchedule.startTime}` : ''}
            />

            <div className="space-y-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">
                        Quản lý lịch giảng dạy
                    </h1>
                    <p className="text-[#717182] text-xl">
                        Quản lý thông tin lịch giảng dạy trong trường Đại học Thủy Lợi
                    </p>
                </div>

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

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <h2 className="text-lg font-semibold text-[#1E3A8A] p-4 border-b border-gray-200">
                        Thống kê lịch giảng dạy - {formatDateVietnamese(selectedDate)}
                    </h2>

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
                                            Phòng học
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
                                                            onClick={() => openDeleteModal(item)}
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
                                                {selectedDate} - {formatDateVietnamese(selectedDate)} chưa có lịch giảng dạy nào.
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
