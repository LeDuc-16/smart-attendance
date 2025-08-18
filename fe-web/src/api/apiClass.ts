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
    try {
        // Cần lấy className từ classId trước
        const classesResponse = await classApiClient.get('/api/v1/classes');
        console.log('Classes response:', classesResponse.data); // Log để debug

        const classes = classesResponse.data.data || classesResponse.data;
        const targetClass = classes.find((c: Class) => c.id === classId);

        if (!targetClass) {
            throw new Error('Không tìm thấy lớp học');
        }

        console.log('Target class found:', targetClass); // Log class
        console.log('Request payload:', {
            className: targetClass.className,
            lecturerId: lecturerId
        }); // Log request

        const response = await classApiClient.post('/api/v1/classes/add-lecturer-to-class', {
            className: targetClass.className,
            lecturerId: lecturerId
        });

        console.log('Add lecturer response:', response.data); // Log response
        return response.data;

    } catch (error: any) {
        console.error('AddLecturerToClass error:', error);
        console.error('Error response:', error.response?.data);
        throw error;
    }
};

// Thêm API lấy danh sách
export const getAllFaculties = async (): Promise<DropdownOption[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:8080/api/v1/faculties", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data.map((faculty: any) => ({
        value: faculty.facultyName,
        label: faculty.facultyName
    }));
};

export const getAllMajors = async (): Promise<DropdownOption[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:8080/api/v1/majors", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data.map((major: any) => ({
        value: major.majorName,
        label: major.majorName
    }));
};

export const getAllClasses = async (): Promise<DropdownOption[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:8080/api/v1/classes", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data.map((classItem: any) => ({
        value: classItem.className,
        label: classItem.className
    }));
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
    advisor?: number;         // ID giảng viên chủ nhiệm
    lecturerName?: string;    // Hiển thị tên/maso giảng viên lên bảng
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
