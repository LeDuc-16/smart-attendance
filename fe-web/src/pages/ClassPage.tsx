import React, { useState, useEffect, useCallback } from 'react';
import { getClasses, createClass, updateClass, deleteClass, getLecturerById, addLecturerToClass, type Class, type ClassPayload } from '../api/apiClass';
import {
    FiEdit,
    FiTrash2,
    FiSearch,
    FiPlus,
    FiX,
    FiUserPlus,
    FiUsers,
    FiUpload,
    FiEye
} from 'react-icons/fi';

const ClassFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ClassPayload) => void;
    initialData: Class | null;
}) => {
    const [formData, setFormData] = useState<ClassPayload>({
        className: '',
        capacityStudent: 0,
    });
    const [formError, setFormError] = useState('');

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
            setFormError('');
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'capacityStudent' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.className) {
            setFormError('Vui lòng điền tên lớp.');
            return;
        }
        if (formData.capacityStudent <= 0) {
            setFormError('Sức chứa phải lớn hơn 0.');
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-start p-4">
                    <div>
                        <h3 className="text-xl font-semibold">
                            {initialData ? 'Chỉnh sửa lớp' : 'Thêm lớp mới'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Thêm thông tin lớp học mới.
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
                        </div>
                        {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
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

const ClassPage = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number>(0);
    const itemsPerPage = 5;
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

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

                // Lấy thông tin giảng viên cho từng lớp
                const classesWithLecturer = await Promise.all(
                    classData.map(async (classItem: Class) => {
                        if (classItem.lecturerId) {
                            try {
                                const lecturer = await getLecturerById(classItem.lecturerId);
                                return {
                                    ...classItem,
                                    lecturerName: lecturer.lecturerCode || `Lecturer-${classItem.lecturerId}`
                                };
                            } catch (error) {
                                console.error(`Error fetching lecturer ${classItem.lecturerId}:`, error);
                                return {
                                    ...classItem,
                                    lecturerName: `Lecturer-${classItem.lecturerId}`
                                };
                            }
                        }
                        return classItem;
                    })
                );

                const filteredData = currentSearchTerm
                    ? classesWithLecturer.filter(c => c.className.toLowerCase().includes(currentSearchTerm.toLowerCase()))
                    : classesWithLecturer;

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

    useEffect(() => {
        fetchClasses(currentPage, debouncedSearchTerm);
    }, [currentPage, debouncedSearchTerm, fetchClasses]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const openAddModal = () => {
        setEditingClass(null);
        setIsModalOpen(true);
    };

    const openEditModal = (classItem: Class) => {
        setEditingClass(classItem);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: ClassPayload) => {
        try {
            if (editingClass) {
                await updateClass(editingClass.id, data);
                alert('Cập nhật lớp thành công!');
            } else {
                await createClass(data);
                alert('Thêm lớp thành công!');
            }
            setIsModalOpen(false);
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
            fetchClasses(1, searchTerm);
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

    const handleDeleteClass = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lớp này không?')) {
            try {
                await deleteClass(id);
                alert('Xóa lớp thành công!');
                if (classes.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchClasses(currentPage, debouncedSearchTerm);
                }
            } catch (error) {
                alert('Lỗi: Không thể xóa lớp.');
                console.error(error);
            }
        }
    };

    // Sửa hàm handleAddTeacher - thêm input để nhập lecturerId
    const handleAddTeacher = async (classId: number) => {
        const lecturerIdInput = prompt('Nhập ID của giảng viên chủ nhiệm:');

        if (!lecturerIdInput) {
            return;
        }

        const lecturerId = parseInt(lecturerIdInput);
        if (isNaN(lecturerId)) {
            alert('ID giảng viên phải là số!');
            return;
        }

        try {
            const response = await addLecturerToClass(classId, lecturerId);

            if (response.statusCode === 200) {
                // Lấy thông tin giảng viên
                const lecturer = await getLecturerById(lecturerId);

                // Cập nhật state local ngay lập tức
                setClasses(prevClasses =>
                    prevClasses.map(classItem =>
                        classItem.id === classId
                            ? {
                                ...classItem,
                                lecturerId: lecturerId,
                                lecturerName: lecturer.lecturerCode || `Lecturer-${lecturerId}`
                            }
                            : classItem
                    )
                );

                alert('Thêm giảng viên thành công!');
            }
        } catch (error) {
            console.error('Error adding lecturer:', error);
            alert('Lỗi: Không thể thêm giảng viên.');
        }
    };


    const handleAddStudent = (classId: number) => {
        alert(`Thêm sinh viên vào lớp ID: ${classId}`);
        // TODO: Implement add student functionality
    };

    const handleImportStudents = (classId: number) => {
        alert(`Import sinh viên cho lớp ID: ${classId}`);
        // TODO: Implement import students functionality
    };

    const handleViewDetails = (classId: number) => {
        alert(`Xem chi tiết lớp ID: ${classId}`);
        // TODO: Implement view details functionality
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
                    className={`px-3 py-1 mx-1 rounded-md text-sm font-medium ${currentPage === i
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
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
            <ClassFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingClass}
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

                    {/* Button làm mới */}
                    <button
                        onClick={() => fetchClasses(currentPage, debouncedSearchTerm)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center font-semibold text-sm"
                    >
                        🔄 Làm mới
                    </button>

                    <button
                        onClick={openAddModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center font-semibold text-sm"
                    >
                        <FiPlus className="mr-2" />
                        Thêm lớp
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-700 p-4 border-b border-gray-200">
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng hiện tại</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {classes.length > 0 ? (
                                        classes.map((classItem, index) => (
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    0 / {classItem.capacityStudent}
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
                                                            onClick={() => handleDeleteClass(classItem.id)}
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
                                                        <button
                                                            onClick={() => handleAddStudent(classItem.id)}
                                                            className="text-blue-600 hover:text-blue-900 p-1"
                                                            title="Thêm sinh viên"
                                                        >
                                                            <FiUsers size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleImportStudents(classItem.id)}
                                                            className="text-purple-600 hover:text-purple-900 p-1"
                                                            title="Import sinh viên"
                                                        >
                                                            <FiUpload size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewDetails(classItem.id)}
                                                            className="text-gray-600 hover:text-gray-900 p-1"
                                                            title="Xem chi tiết"
                                                        >
                                                            <FiEye size={16} />
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
