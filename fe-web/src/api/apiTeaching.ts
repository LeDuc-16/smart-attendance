import axios, { type InternalAxiosRequestConfig } from 'axios';

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
    courseName: string;
    lecturerName: string;
    className: string;
    roomName: string;
}


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

const teachingApiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

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

export const getTeachingSchedules = async (): Promise<TeachingSchedule[]> => {
    const response = await teachingApiClient.get("/api/v1/schedules");
    return response.data.data;
};


export const getSchedulesByLecturer = async (lecturerId: number): Promise<TeachingSchedule[]> => {
    const response = await teachingApiClient.get(`/api/v1/schedules/lecturer/${lecturerId}`);
    return response.data.data || [];
};


export const getSchedulesByDate = async (date: string): Promise<TeachingSchedule[]> => {
    try {

        const response = await teachingApiClient.get(`/api/v1/schedules/date/${date}`);
        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 404 || error.response?.status === 500) {
            console.log('Fallback to get all schedules and filter');
            const allResponse = await teachingApiClient.get("/api/v1/schedules");
            const allSchedules = allResponse.data.data;

            return allSchedules.filter((schedule: TeachingSchedule) => {
                return schedule.weeks.some(week =>
                    week.studyDays.some(day => day.date === date)
                );
            });
        }
        throw error;
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