<<<<<<< HEAD
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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LecturerFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    formError,
    faculties,
    lecturers,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LecturerPayload) => void;
    initialData: Lecturer | null;
    formError?: string;
    faculties: Faculty[];
    lecturers: Lecturer[];
}) => {
    const [formData, setFormData] = useState<LecturerPayload>({
        lecturerCode: "",
        academicRank: "",
        account: "",
        email: "",
        password: "",
        name: "",
        facultyId: 0,
    });
    const [inputError, setInputError] = useState('');

    // Danh sách học hàm/học vị
    const academicRanks = [
        "Thạc sĩ",
        "Tiến sĩ",
        "PGS",
        "GS",
        "Kỹ sư",
        "Cử nhân"
    ];

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    lecturerCode: initialData.lecturerCode,
                    academicRank: initialData.academicRank || "",
                    account: "",
                    email: "",
                    password: "",
                    name: initialData.name,
                    facultyId: initialData.facultyId || 0,
                });
            } else {
                setFormData({
                    lecturerCode: "",
                    academicRank: "",
                    account: "",
                    email: "",
                    password: "",
                    name: "",
                    facultyId: 0,
                });
            }
            setInputError('');
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "facultyId" ? Number(value) : value,
        }));
        setInputError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();


        if (!formData.lecturerCode || !formData.name || !formData.facultyId) {
            setInputError("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }

        if (!initialData && (!formData.account || !formData.email || !formData.password)) {
            setInputError("Vui lòng điền đầy đủ thông tin tài khoản.");
            return;
        }

        if (!initialData) {
            // Kiểm tra trùng mã giảng viên khi thêm mới
            const duplicateCode = lecturers.some(l =>
                l.lecturerCode === formData.lecturerCode
            );
            if (duplicateCode) {
                setInputError("Mã giảng viên đã tồn tại. Vui lòng nhập mã khác.");
                return;
            }
        } else {
            const duplicateCode = lecturers.some(l =>
                l.lecturerCode === formData.lecturerCode && l.id !== initialData.id
            );
            if (duplicateCode) {
                setInputError("Mã giảng viên đã tồn tại. Vui lòng nhập mã khác.");
                return;
            }
        }

        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start p-4">
                    <div>
                        <h3 className="text-xl font-semibold text-[#1E3A8A]">
                            {initialData ? 'Chỉnh sửa giảng viên' : 'Thêm mới'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {initialData
                                ? 'Sửa thông tin giảng viên.'
                                : 'Tạo tài khoản và thông tin giảng viên mới.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                            <h4 className="font-semibold">Thông tin giảng viên</h4>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã giảng viên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="lecturerCode"
                                    value={formData.lecturerCode}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ví dụ: GV001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Học hàm/Học vị
                                </label>
                                <select
                                    name="academicRank"
                                    value={formData.academicRank}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Chọn khoa <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="facultyId"
                                    value={formData.facultyId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={0}>-- Chọn khoa --</option>
                                    {faculties.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.facultyName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {!initialData && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tài khoản <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="account"
                                            value={formData.account}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Tên đăng nhập"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="example@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mật khẩu <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Mật khẩu"
                                        />
                                    </div>
                                </>
                            )}

                            {(inputError || formError) && (
                                <p className="text-red-500 text-sm mt-2">{inputError || formError}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end p-4">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                            {initialData ? 'Lưu thay đổi' : 'Thêm giảng viên mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    lecturerName,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    lecturerName: string;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-60">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-0">
                <div className="flex items-start justify-between px-6 pt-6">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa giảng viên</h2>
                            <div className="text-gray-400 text-base font-medium">Hành động không thể hoàn tác</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                        <FiX size={24} />
                    </button>
                </div>
                <div className="px-6 pb-0 pt-4">
                    <span className="text-base text-gray-500">
                        Bạn có chắc chắn muốn xóa giảng viên <span className="font-bold text-black">{lecturerName}</span> khỏi hệ thống?
                    </span>
                </div>
                <div className="flex items-center justify-end gap-6 px-6 pb-6 pt-6">
                    <button
                        className="rounded-lg border border-gray-400 px-6 py-2 text-black font-semibold text-lg transition hover:bg-gray-100"
                        onClick={onClose}
                        type="button"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-lg bg-red-500 px-6 py-2 font-semibold text-white text-lg transition hover:bg-red-600"
                        type="button"
                    >
                        Xóa giảng viên
                    </button>
                </div>
            </div>
        </div>
    );
};

const LecturerPage = () => {
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
    const [modalError, setModalError] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingLecturer, setDeletingLecturer] = useState<Lecturer | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [totalPages, setTotalPages] = useState(1);

    const showSuccessToast = (message: string) => {
        toast.success(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    const showErrorToast = (message: string) => {
        toast.error(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    const getErrorMessage = (serverMessage: string): string => {
        const message = serverMessage.toLowerCase();
        console.log('Analyzing server error:', serverMessage);

        if (message.includes('account') || message.includes('username') || message.includes('tài khoản')) {
            return 'Tài khoản đã tồn tại. Vui lòng chọn tài khoản khác.';
        }

        if (message.includes('email')) {
            return 'Email đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.';
        }

        if (message.includes('lecturer_code') || message.includes('lecturercode') ||
            message.includes('mã giảng viên') || message.includes('lecturer code')) {
            return 'Mã giảng viên đã tồn tại. Vui lòng nhập mã khác.';
        }

        if (message.includes('name') && message.includes('tên') &&
            (message.includes('duplicate') || message.includes('exist') || message.includes('tồn tại'))) {
            return 'Tên giảng viên đã tồn tại. Vui lòng kiểm tra để tránh trùng lặp.';
        }

        if (message.includes('duplicate') || message.includes('exist') ||
            message.includes('already') || message.includes('tồn tại')) {
            return serverMessage || 'Dữ liệu đã tồn tại trong hệ thống.';
        }

        return serverMessage || 'Có lỗi xảy ra. Vui lòng thử lại.';
    };

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
        setModalError('');
        setIsModalOpen(true);
    };

    const openEditModal = (lecturer: Lecturer) => {
        setEditingLecturer(lecturer);
        setModalError('');
        setIsModalOpen(true);
    };

    const openDeleteModal = (lecturer: Lecturer) => {
        setDeletingLecturer(lecturer);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletingLecturer(null);
        setIsDeleteModalOpen(false);
    };

    const handleFormSubmit = async (data: LecturerPayload) => {
        setModalError('');
        try {
            if (editingLecturer) {
                const updatePayload = {
                    lecturerCode: data.lecturerCode,
                    name: data.name,
                    academicRank: data.academicRank,
                    facultyId: data.facultyId,
                };
                await updateLecturer(editingLecturer.id, updatePayload);
                showSuccessToast("Cập nhật giảng viên thành công!");
            } else {
                await createLecturer(data);
                showSuccessToast("Thêm giảng viên thành công!");
            }
            setIsModalOpen(false);
            fetchLecturers();
        } catch (error: any) {
            console.error("API Error:", error.response || error);

            const serverMessage = error.response?.data?.message || error.message || '';
            console.log('Full error response:', error.response);


            const errorMessage = getErrorMessage(serverMessage);
            setModalError(errorMessage);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingLecturer) return;

        try {
            await deleteLecturer(deletingLecturer.id);
            showSuccessToast('Xóa giảng viên thành công!');
            closeDeleteModal();

            if (lecturers.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchLecturers();
            }
        } catch (error) {
            showErrorToast('Lỗi: Không thể xóa giảng viên.');
            console.error(error);
            closeDeleteModal();
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const renderPagination = () => {
        let pageButtons = [];
        let pages: number[] = [];
        if (totalPages <= 3) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 2) {
            pages = [1, 2, 3];
        } else if (currentPage >= totalPages - 1) {
            pages = [totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [currentPage - 1, currentPage, currentPage + 1];
        }

        pageButtons = pages.map(i => (
            <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`px-3 py-1 mx-1 rounded-md text-sm font-medium ${currentPage === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
            >
                {i}
            </button>
        ));

        const startItem = lecturers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
        const endItem = Math.min(currentPage * itemsPerPage, lecturers.length);

        return (
            <div className="flex items-center justify-between mt-4 px-4 py-3">
                <span className="text-sm text-gray-600">
                    Hiển thị {startItem} - {endItem} của {lecturers.length} giảng viên
                </span>
                <div className="flex items-center">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 mx-1 rounded-md bg-white text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        &lt; Trước
                    </button>
                    {pageButtons}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 mx-1 rounded-md bg-white text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        Tiếp &gt;
                    </button>
                </div>
            </div>
        );
    };

    const paginatedLecturers = lecturers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            <ToastContainer />
            <LecturerFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setModalError('');
                }}
                onSubmit={handleFormSubmit}
                initialData={editingLecturer}
                formError={modalError}
                faculties={faculties}
                lecturers={lecturers}
            />
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                lecturerName={deletingLecturer?.name || ''}
            />

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
                            placeholder="Tìm kiếm theo mã giảng viên hoặc tên..."
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
                    <h2 className="text-lg font-semibold text-[#1E3A8A] p-4 border-b border-gray-200">
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
                                            STT
                                        </th>
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
                                        paginatedLecturers.map((lecturer, index) => (
                                            <tr key={lecturer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
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
                                                            <FiEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(lecturer)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Xóa"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-6 text-gray-500">
                                                Không tìm thấy giảng viên nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {totalPages > 0 && renderPagination()}
                </div>
            </div>
        </>
    );
};

export default LecturerPage;
=======

const LecturerPage = () => {
  return (
    <div>LecturerPage</div>
  )
}

export default LecturerPage
>>>>>>> 0613f4f1dda44d5ae357617c15b1bee095de8123
