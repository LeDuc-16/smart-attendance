import axios, { type InternalAxiosRequestConfig } from 'axios';

// Interface cho lịch giảng dạy
export interface StudyDay {
    dayOfWeek: string;
    date: string;
}

export interface Week {
    weekNumber: number;
    startDate: string;
    endDate: string;
    studyDays: StudyDay[];
}

export interface TeachingSchedule {
    id: number;
    startTime: string;
    endTime: string;
    courseId: number;
    lecturerId: number;
    classId: number;
    roomId: number;
    weeks: Week[];
    // Thêm các trường hiển thị
    courseName?: string;
    lecturerName?: string;
    className?: string;
    roomCode?: string;
    capacityStudent?: number;
}

// Payload cho tạo lịch giảng dạy
export interface TeachingSchedulePayload {
    startDate: string;
    endDate: string;
    dayOfWeek: string[];
    startTime: string;
    endTime: string;
    courseId: number;
    lecturerId: number;
    classId: number;
    roomId: number;
}

// Option cho dropdown
export interface DropdownOption {
    value: number;
    label: string;
}

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    path: string;
    data: T;
}

// Tạo axios instance riêng cho teaching API
const teachingApiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// request interceptor để auto gửi token
teachingApiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// response interceptor để handle 403 (login timeout)
teachingApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --------- API TEACHING SCHEDULE CRUD ---------
export const getTeachingSchedules = async (): Promise<TeachingSchedule[]> => {
    const response = await teachingApiClient.get("/api/v1/schedules");
    return response.data.data;
};

// Thay vì gọi API riêng cho date, dùng API lấy tất cả rồi filter
export const getSchedulesByLecturerId = async (lecturerId: number): Promise<TeachingSchedule[]> => {
    try {
        const response = await teachingApiClient.get(`/api/v1/schedules/lecturer/${lecturerId}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching schedules for lecturer ${lecturerId}:`, error);
        return [];
    }
};



export const createTeachingSchedule = async (data: TeachingSchedulePayload): Promise<ApiResponse<TeachingSchedule>> => {
    const response = await teachingApiClient.post("/api/v1/schedules", data);
    return response.data;
};

export const updateTeachingSchedule = async (id: number, data: TeachingSchedulePayload): Promise<ApiResponse<TeachingSchedule>> => {
    const response = await teachingApiClient.put(`/api/v1/schedules/${id}`, data);
    return response.data;
};

export const deleteTeachingSchedule = async (id: number): Promise<ApiResponse<null>> => {
    const response = await teachingApiClient.delete(`/api/v1/schedules/${id}`);
    return response.data;
};

// --------- API Lấy danh sách option dropdown ---------
export const getAllCourses = async (): Promise<DropdownOption[]> => {
    try {
        const response = await teachingApiClient.get("/api/v1/courses");
        const data = response.data.data || response.data;
        return data.map((course: any) => ({
            value: course.id,
            label: course.courseName || course.name
        }));
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
};

export const getAllLecturers = async (): Promise<DropdownOption[]> => {
    try {
        const response = await teachingApiClient.get("/api/v1/lecturers");
        const data = response.data.data || response.data;
        return data.map((lecturer: any) => ({
            value: lecturer.id,
            label: lecturer.name || lecturer.lecturerCode
        }));
    } catch (error) {
        console.error('Error fetching lecturers:', error);
        return [];
    }
};

export const getAllClassesForDropdown = async (): Promise<DropdownOption[]> => {
    try {
        const response = await teachingApiClient.get("/api/v1/classes");
        const data = response.data.data || response.data;
        return data.map((classItem: any) => ({
            value: classItem.id,
            label: classItem.className
        }));
    } catch (error) {
        console.error('Error fetching classes:', error);
        return [];
    }
};

export const getAllRooms = async (): Promise<DropdownOption[]> => {
    try {
        const response = await teachingApiClient.get("/api/v1/rooms");
        const data = response.data.data || response.data;
        return data.map((room: any) => ({
            value: room.id,
            label: room.roomCode
        }));
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }
};
