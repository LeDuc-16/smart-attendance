import React, { useState, useEffect, useCallback } from 'react';
import { getFaculties, createFaculty, updateFaculty, deleteFaculty, type Faculty, type FacultyPayload } from '../api/apiFaculty';
import { FiEdit, FiTrash2, FiSearch, FiPlus, FiX } from 'react-icons/fi';

const FacultyFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FacultyPayload) => void;
    initialData: Faculty | null;
}) => {
    const [formData, setFormData] = useState<FacultyPayload>({
        facultyName: '',
    });
    const [formError, setFormError] = useState('');
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    facultyName: initialData.facultyName,
                });
            } else {
                setFormData({ facultyName: '' });
            }
            setFormError('');
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation đơn giản chỉ cho tên khoa
        if (!formData.facultyName) {
            setFormError('Vui lòng điền tên khoa.');
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-start p-4">
                    <div>
                        <h3 className="text-xl font-semibold">{initialData ? 'Chỉnh sửa khoa' : 'Thêm mới'}</h3>
                        <p className="text-sm text-gray-500 mt-1">Thêm thông tin khoa mới.</p>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khoa <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="facultyName"
                                    value={formData.facultyName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
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


const FacultyPage = () => {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number>(0);
    const itemsPerPage = 5;
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');


    const fetchFaculties = useCallback(async (pageToFetch: number, currentSearchTerm: string) => {
        setLoading(true);
        setError(null);
        try {
            // Kiểm tra token
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
            console.log('API Response:', response); if (response && response.data) {
                // Nếu BE trả về mảng trực tiếp
                if (Array.isArray(response.data)) {
                    const filteredData = currentSearchTerm
                        ? response.data.filter(f => f.facultyName.toLowerCase().includes(currentSearchTerm.toLowerCase()))
                        : response.data;

                    setFaculties(filteredData);
                    setTotalItems(filteredData.length);
                    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
                }
                // Nếu BE trả về đúng format PageableResponse
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
        } catch (err) {
            setError('Thử thêm dữ liệu trên be');
            console.error(err);
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
        setIsModalOpen(true);
    };

    const openEditModal = (faculty: Faculty) => {
        setEditingFaculty(faculty);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: FacultyPayload) => {
        try {
            if (editingFaculty) {
                await updateFaculty(editingFaculty.id, data);
                alert('Cập nhật khoa thành công!');
            } else {
                await createFaculty(data);
                alert('Thêm khoa thành công!');
            }
            setIsModalOpen(false);
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
            fetchFaculties(1, searchTerm);

        } catch (error: any) {
            console.error("API Error:", error.response || error);

            const serverMessage = error.response?.data?.message;
            const statusCode = error.response?.status;

            let displayMessage = `Lỗi: Không thể thực hiện thao tác.`;
            if (statusCode) {
                displayMessage += ` (Mã lỗi: ${statusCode})`;
            }
            if (serverMessage) {
                displayMessage = serverMessage;
            }

            alert(displayMessage);
        }
    };

    const handleDeleteFaculty = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khoa này không?')) {
            try {
                await deleteFaculty(id);
                alert('Xóa khoa thành công!');
                if (faculties.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchFaculties(currentPage, debouncedSearchTerm);
                }
            } catch (error) {
                alert('Lỗi: Không thể xóa khoa.');
                console.error(error);
            }
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPagination = () => {
        const pageButtons = [];
        for (let i = 1; i <= totalPages; i++) {
            pageButtons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 mx-1 rounded-md text-sm font-medium ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                >
                    {i}
                </button>
            );
        }

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
            <FacultyFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingFaculty}
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
                    <h2 className="text-lg font-semibold text-gray-700 p-4 border-b border-gray-200">Danh sách khoa</h2>
                    {loading ? (
                        <p className="p-6 text-center text-gray-500">Đang tải dữ liệu...</p>
                    ) : error ? (
                        <p className="p-6 text-center text-red-600">{error}</p>
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
                                        faculties.map((faculty) => (
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
                                                            onClick={() => handleDeleteFaculty(faculty.id)}
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
                                            <td colSpan={2} className="text-center py-6 text-gray-500">
                                                Không tìm thấy khoa nào.
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
