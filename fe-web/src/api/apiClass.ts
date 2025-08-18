import axios, { type InternalAxiosRequestConfig } from 'axios';

const classApiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

classApiClient.interceptors.request.use(
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

export const addLecturerToClass = async (classId: number, lecturerId: number) => {
    const token = localStorage.getItem("token");
    const response = await classApiClient.post('/api/v1/classes/add-lecturer-to-class', {
        className: `lop${classId}`,
        lecturerId: lecturerId
    }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Thêm vào apiClass.ts
export const getClassWithLecturer = async (classId: number) => {
    const token = localStorage.getItem("token");
    const response = await classApiClient.get(`/api/v1/classes/${classId}/lecturer`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
};



classApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);


export interface Class {
    id: number;
    className: string;
    capacityStudent: number;
    lecturerId?: number;
    lecturerName?: string;
}

// trong apiClass.ts
export const getLecturerById = async (lecturerId: number) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`http://localhost:8080/api/v1/lecturers/${lecturerId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
};


export interface ClassPayload {
    className: string;
    capacityStudent: number;
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
export const getClasses = async (params?: { page?: number; size?: number; search?: string }): Promise<ApiResponse<PageableResponse<Class>>> => {
    const response = await classApiClient.get('/api/v1/classes', { params });
    return response.data;
};

export const createClass = async (data: ClassPayload): Promise<ApiResponse<Class>> => {
    const response = await classApiClient.post('/api/v1/classes', data);
    return response.data;
};

export const updateClass = async (id: number, data: ClassPayload): Promise<ApiResponse<Class>> => {
    const response = await classApiClient.put(`/api/v1/classes/${id}`, data);
    return response.data;
};

export const deleteClass = async (id: number): Promise<ApiResponse<null>> => {
    const response = await classApiClient.delete(`/api/v1/classes/${id}`);
    return response.data;
};
