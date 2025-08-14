// src/api/apiFaculty.ts
// Phiên bản này hoạt động độc lập, không cần file axiosClient.ts

import axios, { type InternalAxiosRequestConfig } from 'axios';

// --- Cấu hình Axios cục bộ cho riêng Faculty API ---
const facultyApiClient = axios.create({
    // Phải khai báo đầy đủ URL của backend ở đây
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Interceptor cục bộ ---
// Đoạn mã này sẽ được thực thi trước mỗi request TỪ FILE NÀY
// Nó sẽ lấy token từ localStorage và gắn vào header
facultyApiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Thêm header Authorization cho các request của faculty
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// --- Định nghĩa các kiểu dữ liệu (Interfaces) ---
// Bạn có thể giữ chúng ở đây hoặc chuyển ra file types.ts riêng
export interface Faculty {
    id: number;
    facultyCode: string;
    facultyName: string;
    contactEmail: string;
}

export interface FacultyPayload {
    facultyName: string;
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


// --- Các hàm gọi API cho Khoa ---
// Các hàm này sử dụng `facultyApiClient` cục bộ đã được cấu hình ở trên

export const getFaculties = async (params?: { page?: number; size?: number; search?: string }): Promise<ApiResponse<PageableResponse<Faculty>>> => {
    const response = await facultyApiClient.get('/api/v1/faculties', { params });
    return response.data;
};

export const createFaculty = async (data: FacultyPayload): Promise<ApiResponse<Faculty>> => {
    const response = await facultyApiClient.post('/api/v1/faculties', data);
    return response.data;
};

export const updateFaculty = async (id: number, data: FacultyPayload): Promise<ApiResponse<Faculty>> => {
    const response = await facultyApiClient.put(`/api/v1/faculties/${id}`, data);
    return response.data;
};

export const deleteFaculty = async (id: number): Promise<ApiResponse<null>> => {
    const response = await facultyApiClient.delete(`/api/v1/faculties/${id}`);
    return response.data;
};
