import axios, { type InternalAxiosRequestConfig } from 'axios';

const majorApiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' },
});

majorApiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

export interface Major {
    id: number;
    majorName: string;
    facultyId: number;
    facultyName: string;
}

export interface MajorPayload {
    majorName: string;
    facultyId: number;
}

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    path: string;
    data: T;
}

export const getMajors = async (): Promise<Major[]> => {
    const response = await majorApiClient.get('/api/v1/majors/list');
    return response.data.data;
};

export const createMajor = async (data: MajorPayload): Promise<ApiResponse<Major>> => {
    const response = await majorApiClient.post('/api/v1/majors', data);
    return response.data;
};

export const updateMajor = async (id: number, data: MajorPayload): Promise<ApiResponse<Major>> => {
    const response = await majorApiClient.put(`/api/v1/majors/${id}`, data);
    return response.data;
};

export const deleteMajor = async (id: number): Promise<ApiResponse<null>> => {
    const response = await majorApiClient.delete(`/api/v1/majors/${id}`);
    return response.data;
};
