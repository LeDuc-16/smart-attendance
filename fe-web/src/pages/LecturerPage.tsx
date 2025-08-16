import React, { useState, useEffect, useCallback } from "react";
import { FiEdit, FiTrash2, FiSearch, FiPlus, FiX } from "react-icons/fi";
import type { Lecturer, LecturerPayload, Faculty } from "../api/apiLecturer";
import {
    getLecturers,
    createLecturer,
    updateLecturer,
    deleteLecturer,
    getAllFaculties,
} from "../api/apiLecturer";

const LecturerPage = () => {
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
    const [formData, setFormData] = useState<LecturerPayload>({
        lecturerCode: "",
        academicRank: "",
        facultyId: null,
    });
    const [formError, setFormError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [totalPages, setTotalPages] = useState(1);

    // Lấy danh sách giảng viên
    const fetchLecturers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data: Lecturer[] = await getLecturers();
            if (debouncedSearchTerm) {
                data = data.filter((l) =>
                    l.lecturerCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                );
            }
            setLecturers(data);
            setTotalPages(Math.ceil(data.length / itemsPerPage));
        } catch (err) {
            console.error(err);
            setError("Không tải được danh sách giảng viên.");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm]);

    // Lấy danh sách khoa
    const fetchFaculties = useCallback(async () => {
        try {
            const data = await getAllFaculties();
            setFaculties(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchLecturers();
        fetchFaculties();
    }, [fetchLecturers, fetchFaculties]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const openAddModal = () => {
        setEditingLecturer(null);
        setFormData({ lecturerCode: "", academicRank: "", facultyId: null });
        setFormError("");
        setIsModalOpen(true);
    };

    const openEditModal = (lecturer: Lecturer) => {
        setEditingLecturer(lecturer);
        setFormData({
            lecturerCode: lecturer.lecturerCode,
            academicRank: lecturer.academicRank,
            facultyId: lecturer.facultyId,
        });
        setFormError("");
        setIsModalOpen(true);
    };

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "facultyId" ? Number(value) : value,
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.lecturerCode || !formData.facultyId) {
            setFormError("Vui lòng điền đầy đủ thông tin.");
            return;
        }
        try {
            if (editingLecturer) {
                await updateLecturer(editingLecturer.id, formData);
                alert("Cập nhật giảng viên thành công!");
            } else {
                await createLecturer(formData);
                alert("Thêm giảng viên thành công!");
            }
            setIsModalOpen(false);
            fetchLecturers();
        } catch (err) {
            console.error(err);
            alert("Lỗi: Không thể thực hiện thao tác.");
        }
    };

    const handleDeleteLecturer = async (id: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa giảng viên này không?")) {
            try {
                await deleteLecturer(id);
                alert("Xóa giảng viên thành công!");
                fetchLecturers();
            } catch (err) {
                console.error(err);
                alert("Lỗi: Không thể xóa giảng viên.");
            }
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const paginatedLecturers = lecturers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-semibold">
                                {editingLecturer ? "Chỉnh sửa giảng viên" : "Thêm giảng viên mới"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)}>
                                <FiX size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block mb-1 font-medium">
                                        Mã giảng viên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lecturerCode"
                                        value={formData.lecturerCode}
                                        onChange={handleFormChange}
                                        className="w-full border px-3 py-2 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Học hàm/Học vị</label>
                                    <input
                                        type="text"
                                        name="academicRank"
                                        value={formData.academicRank || ""}
                                        onChange={handleFormChange}
                                        className="w-full border px-3 py-2 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">
                                        Chọn khoa <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="facultyId"
                                        value={formData.facultyId || 0}
                                        onChange={handleFormChange}
                                        className="w-full border px-3 py-2 rounded-md"
                                    >
                                        <option value={0}>-- Chọn khoa --</option>
                                        {faculties.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.facultyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                            </div>
                            <div className="flex justify-end p-4">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                                >
                                    {editingLecturer ? "Lưu" : "Thêm"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Page Content */}
            <div className="space-y-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">
                        Quản lý giảng viên
                    </h1>
                    <p className="text-[#717182] text-xl">
                        Quản lý thông tin các giảng viên trong trường Đại học Thủy Lợi
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã giảng viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center font-semibold text-sm"
                    >
                        <FiPlus className="mr-2" /> Thêm giảng viên
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-700 p-4 border-b border-gray-200">
                        Danh sách giảng viên
                    </h2>
                    {loading ? (
                        <p className="p-6 text-center text-gray-500">Đang tải dữ liệu...</p>
                    ) : error ? (
                        <p className="p-6 text-center text-red-600">{error}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mã GV
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tên giảng viên
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khoa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Học hàm/Học vị
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedLecturers.length > 0 ? (
                                        paginatedLecturers.map((lecturer) => (
                                            <tr key={lecturer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {lecturer.lecturerCode}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {lecturer.fullName || `UserID-${lecturer.userId}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {faculties.find((f) => f.id === lecturer.facultyId)?.facultyName || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {lecturer.academicRank || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-4">
                                                    <button
                                                        onClick={() => openEditModal(lecturer)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Sửa"
                                                    >
                                                        <FiEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteLecturer(lecturer.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Xóa"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-6 text-gray-500">
                                                Không tìm thấy giảng viên nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                    )}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 px-4 py-3">
                            <div className="flex items-center">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 mx-1 rounded-md bg-white text-gray-700 border border-gray-300 disabled:opacity-50 text-sm"
                                >
                                    &lt; Trước
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 mx-1 rounded-md text-sm font-medium ${currentPage === page
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 mx-1 rounded-md bg-white text-gray-700 border border-gray-300 disabled:opacity-50 text-sm"
                                >
                                    Tiếp &gt;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default LecturerPage;
