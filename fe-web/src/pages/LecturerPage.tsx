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
        account: "",
        email: "",
        password: "",
        name: "",
        facultyId: 0,
    });
    const [formError, setFormError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [totalPages, setTotalPages] = useState(1);

    // Danh sách học hàm/học vị
    const academicRanks = [
        "Thạc sĩ",
        "Tiến sĩ",
        "PGS",
        "GS",
        "Kỹ sư",
        "Cử nhân"
    ];

    // Lấy danh sách giảng viên
    const fetchLecturers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data: Lecturer[] = await getLecturers();
            if (debouncedSearchTerm) {
                data = data.filter((l) =>
                    l.lecturerCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    l.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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
        setFormData({
            lecturerCode: "",
            academicRank: "",
            account: "",
            email: "",
            password: "",
            name: "",
            facultyId: 0,
        });
        setFormError("");
        setIsModalOpen(true);
    };

    const openEditModal = (lecturer: Lecturer) => {
        setEditingLecturer(lecturer);
        setFormData({
            lecturerCode: lecturer.lecturerCode,
            academicRank: lecturer.academicRank || "",
            account: "", // Không hiển thị account cũ
            email: "",   // Không hiển thị email cũ
            password: "", // Không hiển thị password
            name: lecturer.name,
            facultyId: lecturer.facultyId || 0,
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

        // Validation
        if (!formData.lecturerCode || !formData.name || !formData.facultyId) {
            setFormError("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }

        if (!editingLecturer && (!formData.account || !formData.email || !formData.password)) {
            setFormError("Vui lòng điền đầy đủ thông tin tài khoản.");
            return;
        }

        try {
            if (editingLecturer) {
                // Chỉ gửi các trường cần thiết khi sửa
                const updatePayload = {
                    lecturerCode: formData.lecturerCode,
                    name: formData.name,
                    academicRank: formData.academicRank,
                    facultyId: formData.facultyId,
                };
                await updateLecturer(editingLecturer.id, updatePayload);
                alert("Cập nhật giảng viên thành công!");
            } else {
                await createLecturer(formData);
                alert("Thêm giảng viên thành công!");
            }
            setIsModalOpen(false);
            fetchLecturers();
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.message || "Không thể thực hiện thao tác.";
            alert(`Lỗi: ${errorMessage}`);
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
                <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-semibold">
                                {editingLecturer ? "Chỉnh sửa giảng viên" : "Thêm giảng viên mới"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
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
                                        className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ví dụ: LEC-001"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Học hàm/Học vị</label>
                                    <select
                                        name="academicRank"
                                        value={formData.academicRank}
                                        onChange={handleFormChange}
                                        className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Chọn học hàm/học vị --</option>
                                        {academicRanks.map((rank) => (
                                            <option key={rank} value={rank}>
                                                {rank}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">
                                        Chọn khoa <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="facultyId"
                                        value={formData.facultyId}
                                        onChange={handleFormChange}
                                        className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={0}>-- Chọn khoa --</option>
                                        {faculties.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.facultyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Chỉ hiển thị thông tin tài khoản khi thêm mới */}
                                {!editingLecturer && (
                                    <>
                                        <div>
                                            <label className="block mb-1 font-medium">
                                                Tài khoản <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="account"
                                                value={formData.account}
                                                onChange={handleFormChange}
                                                className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Tên đăng nhập"
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-1 font-medium">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleFormChange}
                                                className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="example@email.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-1 font-medium">
                                                Mật khẩu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleFormChange}
                                                className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Mật khẩu"
                                            />
                                        </div>
                                    </>
                                )}

                                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                            </div>
                            <div className="flex justify-end p-4 border-t">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                                >
                                    {editingLecturer ? "Lưu thay đổi" : "Thêm giảng viên"}
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
                                                    {lecturer.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {faculties.find((f) => f.id === lecturer.facultyId)?.facultyName || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {lecturer.academicRank || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-4">
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
                                                    </div>
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
                            <span className="text-sm text-gray-600">
                                Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, lecturers.length)} của {lecturers.length} giảng viên
                            </span>
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
