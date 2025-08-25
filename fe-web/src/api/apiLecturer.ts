import axios from "axios";

export interface Lecturer {
    id: number;
    lecturerCode: string;
    name: string;           // Tên giảng viên từ BE
    academicRank: string | null;
    userId: number;
    facultyId: number | null;
}

export interface LecturerPayload {
    lecturerCode: string;
    academicRank: string;
    account: string;
    email: string;
    password: string;
    name: string;
    facultyId: number;
}

export interface Faculty {
    id: number;
    facultyName: string;
}

// Lấy danh sách giảng viên
export const getLecturers = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:8080/api/v1/lecturers", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
};

// Thêm giảng viên
export const createLecturer = async (data: LecturerPayload) => {
    const token = localStorage.getItem("token");
    const response = await axios.post("http://localhost:8080/api/v1/lecturers", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Cập nhật giảng viên
export const updateLecturer = async (id: number, data: Partial<LecturerPayload>) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`http://localhost:8080/api/v1/lecturers/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Xóa giảng viên
export const deleteLecturer = async (id: number) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`http://localhost:8080/api/v1/lecturers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Lấy danh sách khoa
export const getAllFaculties = async (): Promise<Faculty[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:8080/api/v1/faculties", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
};
// Thêm hàm check tài khoản 
export const checkAccountExists = async (account: string) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`http://localhost:8080/api/v1/users/check-account/${account}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};