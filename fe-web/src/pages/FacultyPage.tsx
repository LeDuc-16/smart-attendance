import React, { useState, useEffect, useCallback } from 'react';
import { getFaculties, createFaculty, updateFaculty, deleteFaculty, type Faculty, type FacultyPayload } from '../api/apiFaculty';
import { FiEdit, FiTrash2, FiSearch, FiPlus, FiX } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FacultyFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    formError,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FacultyPayload) => void;
    initialData: Faculty | null;
    formError?: string;
}) => {
    const [formData, setFormData] = useState<FacultyPayload>({
        facultyName: '',
    });
    const [inputError, setInputError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    facultyName: initialData.facultyName,
                });
            } else {
                setFormData({ facultyName: '' });
            }
            setInputError('');
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setInputError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.facultyName.trim()) {
            setInputError('Vui lòng điền tên khoa.');
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
                            {initialData ? 'Chỉnh sửa khoa' : 'Thêm mới'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {initialData
                                ? 'Sửa thông tin khoa.'
                                : 'Thêm thông tin khoa mới.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                            <h4 className="font-semibold">Thông tin khoa</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên khoa <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="facultyName"
                                    value={formData.facultyName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập tên khoa"
                                />
                                {(inputError || formError) && (
                                    <p className="text-red-500 text-sm mt-2">{inputError || formError}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end p-4">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                            {initialData ? 'Lưu thay đổi' : 'Thêm khoa mới'}
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
    facultyName,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    facultyName: string;
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
                            <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa khoa</h2>
                            <div className="text-gray-400 text-base font-medium">Hành động không thể hoàn tác</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                        <FiX size={24} />
                    </button>
                </div>
                <div className="px-6 pb-0 pt-4">
                    <span className="text-base text-gray-500">
                        Bạn có chắc chắn muốn xóa khoa <span className="font-bold text-black">{facultyName}</span> khỏi hệ thống?
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
                        Xóa khoa
                    </button>
                </div>
            </div>
        </div>
    );
};

const FacultyPage = () => {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
    const [modalError, setModalError] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);

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

    const fetchFaculties = useCallback(async (pageToFetch: number, currentSearchTerm: string) => {
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

            const response = await getFaculties(params);
            console.log('API Response:', response);

            if (response && response.data) {
                if (Array.isArray(response.data)) {
                    const filteredData = currentSearchTerm
                        ? response.data.filter(f => f.facultyName.toLowerCase().includes(currentSearchTerm.toLowerCase()))
                        : response.data;

                    setFaculties(filteredData);
                    setTotalItems(filteredData.length);
                    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
                }
                else if (Array.isArray(response.data.content)) {
                    setFaculties(response.data.content);
                    setTotalItems(response.data.totalElements);
                    setTotalPages(response.data.totalPages);
                }
            } else {
                setFaculties([]);
                setTotalItems(0);
                setTotalPages(0);
            }
        } catch (err: any) {
            console.error('Error fetching faculties:', err);

            if (err.response && err.response.status === 404) {
                // Xử lý như trường hợp không có dữ liệu
                setFaculties([]);
                setTotalItems(0);
                setTotalPages(0);
                setError(null);
            } else if (err.response && err.response.status === 401) {
                setError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (err.response && err.response.status >= 500) {
                setError('Lỗi máy chủ, vui lòng thử lại sau');
            } else if (err.message === 'Network Error') {
                setError('Không thể kết nối đến máy chủ');
            } else {
                setError('Có lỗi xảy ra khi tải dữ liệu');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFaculties(currentPage, debouncedSearchTerm);
    }, [currentPage, debouncedSearchTerm, fetchFaculties]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const openAddModel = () => {
        setEditingFaculty(null);
        setModalError('');
        setIsModalOpen(true);
    };

    const openEditModal = (faculty: Faculty) => {
        setEditingFaculty(faculty);
        setModalError('');
        setIsModalOpen(true);
    };

    const openDeleteModal = (faculty: Faculty) => {
        setDeletingFaculty(faculty);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletingFaculty(null);
        setIsDeleteModalOpen(false);
    };

    const handleFormSubmit = async (data: FacultyPayload) => {
        setModalError('');
        try {
            if (editingFaculty) {
                await updateFaculty(editingFaculty.id, data);
                showSuccessToast('Cập nhật khoa thành công!');
            } else {
                await createFaculty(data);
                showSuccessToast('Thêm khoa thành công!');
            }
            setIsModalOpen(false);
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
            fetchFaculties(1, searchTerm);
        } catch (error: any) {
            console.error("API Error:", error.response || error);

            const serverMessage = error.response?.data?.message || '';

            // Kiểm tra lỗi trùng tên
            if (serverMessage.includes("tồn tại") ||
                serverMessage.toLowerCase().includes("existed") ||
                serverMessage.toLowerCase().includes("already") ||
                serverMessage.toLowerCase().includes("duplicate")) {
                setModalError('Tên khoa đã tồn tại, vui lòng nhập tên khác');
            } else {
                setModalError('Có lỗi xảy ra, vui lòng thử lại');
            }
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingFaculty) return;

        try {
            await deleteFaculty(deletingFaculty.id);
            showSuccessToast('Xóa khoa thành công!');
            closeDeleteModal();

            if (faculties.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchFaculties(currentPage, debouncedSearchTerm);
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            if (error.response && error.response.status === 409) {
                showErrorToast('Không thể xóa khoa này vì đang có ngành học thuộc khoa');
            } else {
                showErrorToast('Lỗi: Không thể xóa khoa.');
            }
            closeDeleteModal();
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

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
                    Hiển thị {startItem} - {endItem} của {totalItems} khoa
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
            <FacultyFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setModalError('');
                }}
                onSubmit={handleFormSubmit}
                initialData={editingFaculty}
                formError={modalError}
            />
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                facultyName={deletingFaculty?.facultyName || ''}
            />
            <div className="space-y-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">
                        Quản lý khoa
                    </h1>
                    <p className="text-[#717182] text-xl">
                        Quản lý thông tin các khoa trong trường Đại học Thủy Lợi
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên khoa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                        onClick={openAddModel}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center font-semibold text-sm"
                    >
                        <FiPlus className="mr-2" />
                        Thêm khoa
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <h2 className="text-lg font-semibold text-[#1E3A8A] p-4 border-b border-gray-200">Danh sách khoa</h2>
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center">
                            <div className="text-red-600 mb-4">
                                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-lg font-medium">{error}</p>
                            </div>
                            <button
                                onClick={() => fetchFaculties(currentPage, debouncedSearchTerm)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khoa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {faculties.length > 0 ? (
                                        faculties
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map((faculty) => (
                                                <tr key={faculty.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {faculty.facultyName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-4">
                                                            <button
                                                                onClick={() => openEditModal(faculty)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                                title="Sửa"
                                                            >
                                                                <FiEdit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(faculty)}
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
                                            <td colSpan={2} className="text-center py-8">
                                                <div className="text-gray-500">
                                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <p className="text-lg font-medium">Chưa có khoa nào</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {searchTerm ? `Không tìm thấy khoa nào với từ khóa "${searchTerm}"` : 'Hãy thêm khoa đầu tiên'}
                                                    </p>
                                                </div>
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

export default FacultyPage;
