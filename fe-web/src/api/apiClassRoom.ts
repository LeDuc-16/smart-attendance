import axios, { type InternalAxiosRequestConfig } from 'axios';

// Interface cho phòng học
export interface ClassRoom {
    id: number;
    roomCode: string;
    locations: string;
}

// Payload cho tạo/sửa phòng học
export interface ClassRoomPayload {
    roomCode: string;
    locations: string;
}

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    path: string;
    data: T;
}

// Tạo axios instance riêng cho classroom API
const classRoomApiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// request interceptor để auto gửi token
classRoomApiClient.interceptors.request.use(
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
classRoomApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --------- API CLASSROOM CRUD ---------
export const getClassRooms = async (): Promise<ClassRoom[]> => {
    const response = await classRoomApiClient.get("/api/v1/rooms");
    return response.data.data;
};

export const createClassRoom = async (data: ClassRoomPayload): Promise<ApiResponse<ClassRoom>> => {
    const response = await classRoomApiClient.post("/api/v1/rooms", data);
    return response.data;
};

export const updateClassRoom = async (id: number, data: ClassRoomPayload): Promise<ApiResponse<ClassRoom>> => {
    const response = await classRoomApiClient.put(`/api/v1/rooms/${id}`, data);
    return response.data;
};

export const deleteClassRoom = async (id: number): Promise<ApiResponse<null>> => {
    const response = await classRoomApiClient.delete(`/api/v1/rooms/${id}`);
    return response.data;
};