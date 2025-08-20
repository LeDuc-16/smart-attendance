import React, { useState, useEffect, useCallback } from 'react';
import {
    getClasses,
    createClass,
    updateClass,
    deleteClass,
    getLecturerById,
    addLecturerToClass,
    getStudentCountByClass,
    type Class,
    type ClassPayload
} from '../api/apiClass';
import { getLecturers } from '../api/apiLecturer';
import {
    FiEdit,
    FiTrash2,
    FiSearch,
    FiPlus,
    FiX,
    FiUserPlus,
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ClassFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    formError,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ClassPayload) => void;
    initialData: Class | null;
    formError?: string;
}) => {
    const [formData, setFormData] = useState<ClassPayload>({
        className: '',
        capacityStudent: 0,
    });
    const [inputError, setInputError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    className: initialData.className,
                    capacityStudent: initialData.capacityStudent,
                });
            } else {
                setFormData({ className: '', capacityStudent: 0 });
            }
            setInputError('');
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'capacityStudent' ? parseInt(value) || 0 : value
        }));
        setInputError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.className.trim()) {
            setInputError('Vui lòng điền tên lớp.');
            return;
        }
        if (formData.capacityStudent <= 0) {
            setInputError('Sức chứa phải lớn hơn 0.');
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-start p-4">
                    <div>
                        <h3 className="text-xl font-semibold text-[#1E3A8A]">
                            {initialData ? 'Chỉnh sửa lớp' : 'Thêm mới'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {initialData
                                ? 'Sửa thông tin lớp học.'
                                : 'Thêm thông tin lớp học mới.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                            <h4 className="font-semibold">Thông tin lớp</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên lớp <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="className"
                                    value={formData.className}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập tên lớp"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sức chứa <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="capacityStudent"
                                    value={formData.capacityStudent}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập sức chứa"
                                />
                            </div>
                            {(inputError || formError) && (
                                <p className="text-red-500 text-sm mt-2">{inputError || formError}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end p-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                        >
                            {initialData ? 'Lưu thay đổi' : 'Thêm lớp mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SelectLecturerModal = ({
    isOpen,
    onClose,
    onSubmit,
    lecturers,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (lecturerId: number) => void;
    lecturers: any[];
}) => {
    const [selectedLecturerId, setSelectedLecturerId] = useState<number>(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLecturerId) {
            toast.error('Vui lòng chọn giảng viên!');
            return;
        }
        onSubmit(selectedLecturerId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-start p-4">
                    <div>
                        <h3 className="text-xl font-semibold text-[#1E3A8A]">
                            Chọn giảng viên chủ nhiệm
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Thêm giảng viên chủ nhiệm.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                            <h4 className="font-semibold">Danh sách giảng viên</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Chọn giảng viên <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedLecturerId}
                                    onChange={(e) => setSelectedLecturerId(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={0}>-- Chọn giảng viên --</option>
                                    {lecturers.map((lecturer) => (
                                        <option key={lecturer.id} value={lecturer.id}>
                                            {lecturer.lecturerCode} - {lecturer.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 p-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                        >
                            Thêm giảng viên
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
    className,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    className: string;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-0">
                <div className="flex items-start justify-between px-6 pt-6">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa lớp</h2>
                            <div className="text-gray-400 text-base font-medium">Hành động không thể hoàn tác</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                        <FiX size={24} />
                    </button>
                </div>
                <div className="px-6 pb-0 pt-4">
                    <span className="text-base text-gray-500">
                        Bạn có chắc chắn muốn xóa lớp <span className="font-bold text-black">{className}</span> khỏi hệ thống?
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
                        Xóa lớp
                    </button>
                </div>
            </div>
        </div>
    );
};

const ClassPage = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [lecturers, setLecturers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [modalError, setModalError] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingClass, setDeletingClass] = useState<Class | null>(null);

    const [isSelectLecturerModalOpen, setIsSelectLecturerModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<number>(0);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number>(0);
    const itemsPerPage = 5;
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

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

    const fetchClasses = useCallback(async (pageToFetch: number, currentSearchTerm: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Vui lòng đăng nhập để tiếp tục');
                window.location.href = '/login';
                return;
            }

            const params = {
                page: pageToFetch - 1,
                size: itemsPerPage,
                search: currentSearchTerm
            };

            const response = await getClasses(params);
            console.log('API Response:', response);

            if (response && response.data) {
                let classData: Class[] = [];

                if (Array.isArray(response.data)) {
                    classData = response.data;
                } else if (Array.isArray(response.data.content)) {
                    classData = response.data.content;
                }

                // Lấy thông tin giảng viên và số lượng sinh viên
                const classesWithDetails = await Promise.all(
                    classData.map(async (classItem: Class) => {
                        // Lấy thông tin giảng viên
                        let lecturerName = "Chưa có giảng viên";
                        if (classItem.advisor) {
                            try {
                                const lecturer = await getLecturerById(classItem.advisor);
                                lecturerName = lecturer.lecturerCode || `${classItem.advisor}`;
                            } catch (error) {
                                lecturerName = `${classItem.advisor}`;
                            }
                        }

                        // Lấy số lượng sinh viên hiện tại
                        let currentStudents = 0;
                        try {
                            currentStudents = await getStudentCountByClass(classItem.className);
                        } catch (error) {
                            console.error('Error getting student count for class:', classItem.className, error);
                        }

                        return {
                            ...classItem,
                            lecturerName,
                            currentStudents
                        };
                    })
                );

                const filteredData = currentSearchTerm
                    ? classesWithDetails.filter(c => c.className.toLowerCase().includes(currentSearchTerm.toLowerCase()))
                    : classesWithDetails;

                setClasses(filteredData);
                setTotalItems(filteredData.length);
                setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
            } else {
                setClasses([]);
                setTotalItems(0);
                setTotalPages(0);
            }
        } catch (err) {
            setError('Thử thêm dữ liệu trên backend');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLecturers = useCallback(async () => {
        try {
            const data = await getLecturers();
            setLecturers(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchClasses(currentPage, debouncedSearchTerm);
        fetchLecturers();
    }, [currentPage, debouncedSearchTerm, fetchClasses, fetchLecturers]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const openAddModal = () => {
        setEditingClass(null);
        setModalError('');
        setIsModalOpen(true);
    };

    const openEditModal = (classItem: Class) => {
        setEditingClass(classItem);
        setModalError('');
        setIsModalOpen(true);
    };

    const openDeleteModal = (classItem: Class) => {
        setDeletingClass(classItem);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletingClass(null);
        setIsDeleteModalOpen(false);
    };

    const handleFormSubmit = async (data: ClassPayload) => {
        setModalError('');
        try {
            if (editingClass) {
                await updateClass(editingClass.id, data);
                showSuccessToast('Cập nhật lớp thành công!');
            } else {
                await createClass(data);
                showSuccessToast('Thêm lớp thành công!');
            }
            setIsModalOpen(false);
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
            fetchClasses(1, searchTerm);
        } catch (error: any) {
            console.error("API Error:", error.response || error);

            const serverMessage = error.response?.data?.message || '';

            // Kiểm tra lỗi trùng tên
            if (serverMessage.includes("tồn tại") ||
                serverMessage.toLowerCase().includes("existed") ||
                serverMessage.toLowerCase().includes("already") ||
                serverMessage.toLowerCase().includes("duplicate")) {
                setModalError('Tên lớp đã tồn tại, vui lòng nhập tên khác');
            } else {
                setModalError('Có lỗi xảy ra, vui lòng thử lại');
            }
        }
    };

    // Xử lý xóa lớp sau khi xác nhận
    const handleConfirmDelete = async () => {
        if (!deletingClass) return;

        try {
            await deleteClass(deletingClass.id);
            showSuccessToast('Xóa lớp thành công!');
            closeDeleteModal();

            if (classes.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchClasses(currentPage, debouncedSearchTerm);
            }
        } catch (error) {
            showErrorToast('Lỗi: Không thể xóa lớp.');
            console.error(error);
            closeDeleteModal();
        }
    };

    const handleAddTeacher = (classId: number) => {
        setSelectedClassId(classId);
        setIsSelectLecturerModalOpen(true);
    };

    const handleSelectLecturer = async (lecturerId: number) => {
        try {
            console.log('Calling API with:', { classId: selectedClassId, lecturerId });

            const response = await addLecturerToClass(selectedClassId, lecturerId);

            console.log('API Response:', response);

            if (response && (response.statusCode === 200 || response.status === 200)) {
                const lecturer = await getLecturerById(lecturerId);

                setClasses(prevClasses =>
                    prevClasses.map(classItem =>
                        classItem.id === selectedClassId
                            ? {
                                ...classItem,
                                advisor: lecturerId,
                                lecturerName: lecturer.lecturerCode || `Lecturer-${lecturerId}`
                            }
                            : classItem
                    )
                );

                showSuccessToast('Thêm giảng viên thành công!');

                await fetchClasses(currentPage, debouncedSearchTerm);
            } else {
                console.error('API returned unexpected response:', response);
                showErrorToast('Lỗi: API trả về response không mong đợi');
            }
        } catch (error: any) {
            console.error('Error adding lecturer:', error);
            console.error('Error details:', error.response?.data);
            showErrorToast(`Lỗi: ${error.response?.data?.message || 'Không thể thêm giảng viên'}`);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
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

        const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        return (
            <div className="flex items-center justify-between mt-4 px-4 py-3">
                <span className="text-sm text-gray-600">
                    Hiển thị {startItem} - {endItem} của {totalItems} lớp
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

    return (
        <>
            <ToastContainer />
            <ClassFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setModalError('');
                }}
                onSubmit={handleFormSubmit}
                initialData={editingClass}
                formError={modalError}
            />
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                className={deletingClass?.className || ''}
            />
            <SelectLecturerModal
                isOpen={isSelectLecturerModalOpen}
                onClose={() => setIsSelectLecturerModalOpen(false)}
                onSubmit={handleSelectLecturer}
                lecturers={lecturers}
            />
            <div className="space-y-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">
                        Quản lý lớp học
                    </h1>
                    <p className="text-[#717182] text-xl">
                        Quản lý thông tin các lớp học trong trường Đại học Thủy Lợi
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên lớp..."
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
                        <FiPlus className="mr-2" />
                        Thêm lớp
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <h2 className="text-lg font-semibold text-[#1E3A8A] p-4 border-b border-gray-200">
                        Danh sách lớp học
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên lớp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảng viên</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sức chứa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng sinh viên hiện tại</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {classes.length > 0 ? (
                                        classes
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map((classItem, index) => (
                                                <tr key={classItem.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {classItem.className}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {classItem.lecturerName || "Chưa có giảng viên"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {classItem.capacityStudent}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`font-medium ${(classItem.currentStudents || 0) >= classItem.capacityStudent
                                                                ? 'text-red-600'
                                                                : 'text-gray-700'
                                                            }`}>
                                                            {classItem.currentStudents || 0} / {classItem.capacityStudent}
                                                        </span>
                                                        {(classItem.currentStudents || 0) >= classItem.capacityStudent && (
                                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                Đầy
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => openEditModal(classItem)}
                                                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                                                title="Sửa"
                                                            >
                                                                <FiEdit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(classItem)}
                                                                className="text-red-600 hover:text-red-900 p-1"
                                                                title="Xóa"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleAddTeacher(classItem.id)}
                                                                className="text-green-600 hover:text-green-900 p-1"
                                                                title="Thêm giảng viên chủ nhiệm"
                                                            >
                                                                <FiUserPlus size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-6 text-gray-500">
                                                Không tìm thấy lớp nào.
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

export default ClassPage;
