import axios, { type InternalAxiosRequestConfig } from 'axios';

const facultyApiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

facultyApiClient.interceptors.request.use(
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


export interface Faculty {
    id: number;
    facultyName: string;
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
