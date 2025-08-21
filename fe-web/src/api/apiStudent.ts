import axios, { type InternalAxiosRequestConfig } from 'axios';

// Interface cho sinh viên
export interface Student {
    id: number;
    studentCode: string;
    studentName: string;
    className: string;
    majorName: string | null;
    facultyName: string | null;
    account: string;
    email: string;
    avatar?: string; // URL ảnh đại diện
}

// Thêm interface cho Major với facultyId
export interface Major {
    id: number;
    majorName: string;
    facultyId: number;
    facultyName: string;
}

export interface Faculty {
    id: number;
    facultyName: string;
}

// Payload cho tạo/sửa sinh viên
export interface StudentPayload {
    className: string;
    studentCode: string;
    studentName: string;
    account: string;
    email: string;
    password?: string;
    facultyName: string;
    majorName: string;
}

// Option cho dropdown
export interface DropdownOption {
    value: string;
    label: string;
}

// Interface cho preview data
export interface PreviewData {
    studentCode?: string;
    studentName?: string;
    account?: string;
    email?: string;
    password?: string;
    majorName?: string;
    facultyName?: string;
    className?: string;
    [key: string]: any;
}

// Tạo axios instance riêng cho student API
const studentApiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// request interceptor để auto gửi token
studentApiClient.interceptors.request.use(
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
studentApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --------- API STUDENT CRUD ---------
export const getStudents = async (): Promise<Student[]> => {
    const response = await studentApiClient.get("/api/v1/students");
    return response.data.data || response.data;
};

export const createStudent = async (data: StudentPayload) => {
    const response = await studentApiClient.post("/api/v1/students", data);
    return response.data;
};

export const updateStudent = async (id: number, data: Partial<StudentPayload>) => {
    const response = await studentApiClient.put(`/api/v1/students/${id}`, data);
    return response.data;
};

export const deleteStudent = async (id: number) => {
    const response = await studentApiClient.delete(`/api/v1/students/${id}`);
    return response.data;
};

// --------- API upload và lấy ảnh sinh viên -------
export const uploadStudentImage = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await studentApiClient.post(`/api/v1/students/${id}/profile-image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getStudentImage = async (id: number): Promise<string> => {
    try {
        const response = await studentApiClient.get(`/api/v1/students/${id}/profile-image`, {
            responseType: 'blob'
        });

        // Tạo URL từ blob để hiển thị ảnh
        const imageUrl = URL.createObjectURL(response.data);
        return imageUrl;
    } catch (error) {
        console.error('Error fetching student image:', error);
        return 'https://via.placeholder.com/150x150/cccccc/ffffff?text=Avatar';
    }
};

// --------- API Preview và Import Excel ---------
export const previewExcelFile = async (file: File): Promise<PreviewData[]> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await studentApiClient.post('/api/v1/students/preview-excel', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data.data || response.data;
};

export const importStudentsFromExcel = async (file: File, className?: string) => {
    const formData = new FormData();
    formData.append("file", file);

    let url = '/api/v1/students/import';
    if (className) {
        url += `?className=${encodeURIComponent(className)}`;
    }

    const response = await studentApiClient.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// --------- API kiểm tra capacity lớp học -------
export const checkClassCapacityBeforeAdd = async (className: string): Promise<{ canAdd: boolean; currentCount: number; capacity: number }> => {
    try {
        // Gọi API lấy danh sách sinh viên để đếm
        const studentsResponse = await studentApiClient.get('/api/v1/students');
        const allStudents = studentsResponse.data.data || studentsResponse.data;
        const classStudents = allStudents.filter((s: any) => s.className === className);

        // Lấy thông tin capacity từ API classes
        const classesResponse = await studentApiClient.get('/api/v1/classes');
        const classes = classesResponse.data.data || classesResponse.data;
        const targetClass = classes.find((c: any) => c.className === className);

        const capacity = targetClass ? targetClass.capacityStudent : 0;
        const currentCount = classStudents.length;

        return {
            canAdd: currentCount < capacity,
            currentCount,
            capacity
        };
    } catch (error) {
        console.error('Error checking capacity:', error);
        return { canAdd: false, currentCount: 0, capacity: 0 };
    }
};

// --------- API Lấy danh sách option dropdown ---------
export const getAllFaculties = async (): Promise<Faculty[]> => {
    try {
        const response = await studentApiClient.get("/api/v1/faculties");
        console.log('Faculties response:', response.data);

        const data = response.data.data || response.data;
        if (!Array.isArray(data)) {
            console.error('Faculties data is not an array:', data);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Error fetching faculties:', error);
        return [];
    }
};

export const getAllMajors = async (): Promise<Major[]> => {
    try {
        const response = await studentApiClient.get("/api/v1/majors/list");
        console.log('Majors response:', response.data);

        const data = response.data.data || response.data;
        if (!Array.isArray(data)) {
            console.error('Majors data is not an array:', data);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Error fetching majors:', error);
        return [];
    }
};

export const getAllClasses = async (): Promise<DropdownOption[]> => {
    try {
        const response = await studentApiClient.get("/api/v1/classes");
        console.log('Classes response:', response.data);

        const data = response.data.data || response.data;
        if (!Array.isArray(data)) {
            console.error('Classes data is not an array:', data);
            return [];
        }

        return data.map((classItem: any) => ({
            value: classItem.className,
            label: classItem.className
        }));
    } catch (error) {
        console.error('Error fetching classes:', error);
        return [];
    }
};
