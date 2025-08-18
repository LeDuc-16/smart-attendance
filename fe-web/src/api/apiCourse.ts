import axios, { type InternalAxiosRequestConfig } from 'axios';

const courseApiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

courseApiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

courseApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Interfaces
export interface Course {
    id: number;
    courseName: string;
    credits: number;
}

export interface CoursePayload {
    courseName: string;
    credits: number;
}

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    path: string;
    data: T;
}

export interface PageableResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// API Functions
export const getCourses = async (params?: { page?: number; size?: number; search?: string }): Promise<ApiResponse<PageableResponse<Course>>> => {
    const response = await courseApiClient.get('/api/v1/courses', { params });
    return response.data;
};

export const createCourse = async (data: CoursePayload): Promise<ApiResponse<Course>> => {
    const response = await courseApiClient.post('/api/v1/courses', data);
    return response.data;
};

export const updateCourse = async (id: number, data: CoursePayload): Promise<ApiResponse<Course>> => {
    const response = await courseApiClient.put(`/api/v1/courses/${id}`, data);
    return response.data;
};

export const deleteCourse = async (id: number): Promise<ApiResponse<null>> => {
    const response = await courseApiClient.delete(`/api/v1/courses/${id}`);
    return response.data;
};
