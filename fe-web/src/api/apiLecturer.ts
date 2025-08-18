import axios from "axios";

export interface Lecturer {
    id: number;
    lecturerCode: string;
    academicRank: string | null;
    userId: number;
    facultyId: number | null;
    facultyName?: string; // thêm để dễ hiển thị
    fullName?: string;    // lấy từ user nếu BE trả
}

export interface LecturerPayload {
    lecturerCode: string;
    academicRank: string | null;
    facultyId: number | null;
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
    return response.data.data; // dữ liệu chính nằm trong data
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
export const updateLecturer = async (id: number, data: LecturerPayload) => {
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

// Lấy danh sách khoa (dùng lại như ở major)
export const getAllFaculties = async (): Promise<Faculty[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:8080/api/v1/faculties", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
};
