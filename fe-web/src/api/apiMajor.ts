import axios from 'axios';

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

export interface Faculty {
    id: number;
    facultyName: string;
}

// Lấy danh sách ngành
export const getMajors = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:8080/api/v1/majors/list', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Thêm ngành mới
export const createMajor = async (data: MajorPayload) => {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:8080/api/v1/majors', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Cập nhật ngành
export const updateMajor = async (id: number, data: MajorPayload) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`http://localhost:8080/api/v1/majors/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};


export const deleteMajor = async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`http://localhost:8080/api/v1/majors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};


export const getAllFaculties = async (): Promise<Faculty[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:8080/api/v1/faculties', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};