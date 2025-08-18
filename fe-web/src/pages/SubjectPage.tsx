import React, { useState, useEffect, useCallback } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse, type Course, type CoursePayload } from '../api/apiCourse';
import {
    FiEdit,
    FiTrash2,
    FiSearch,
    FiPlus,
    FiX,
    FiDownload,
    FiUpload
} from 'react-icons/fi';

const CourseFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CoursePayload) => void;
    initialData: Course | null;
}) => {
    const [formData, setFormData] = useState<CoursePayload>({
        courseName: '',
        credits: 1,
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    courseName: initialData.courseName,
                    credits: initialData.credits,
                });
            } else {
                setFormData({ courseName: '', credits: 1 });
            }
            setFormError('');
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'credits' ? parseInt(value) || 1 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.courseName) {
            setFormError('Vui lòng điền tên môn học.');
            return;
        }
        if (formData.credits <= 0 || formData.credits > 10) {
            setFormError('Số tín chỉ phải từ 1 đến 10.');
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
                            {initialData ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Thêm thông tin môn học mới.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                            <h4 className="font-semibold">Thông tin môn học</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên môn học <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="courseName"
                                    value={formData.courseName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập tên môn học"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số tín chỉ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="credits"
                                    value={formData.credits}
                                    onChange={handleChange}
                                    min="1"
                                    max="10"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập số tín chỉ"
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
                            {initialData ? 'Lưu thay đổi' : 'Thêm môn học mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CoursePage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number>(0);
    const itemsPerPage = 5;
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const fetchCourses = useCallback(async (pageToFetch: number, currentSearchTerm: string) => {
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

            const response = await getCourses(params);
            console.log('API Response:', response);

            if (response && response.data) {
                let courseData: Course[] = [];

                if (Array.isArray(response.data)) {
                    courseData = response.data;
                } else if (Array.isArray(response.data.content)) {
                    courseData = response.data.content;
                }

                const filteredData = currentSearchTerm
                    ? courseData.filter(c => c.courseName.toLowerCase().includes(currentSearchTerm.toLowerCase()))
                    : courseData;

                setCourses(filteredData);
                setTotalItems(filteredData.length);
                setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
            } else {
                setCourses([]);
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
        fetchCourses(currentPage, debouncedSearchTerm);
    }, [currentPage, debouncedSearchTerm, fetchCourses]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const openAddModal = () => {
        setEditingCourse(null);
        setIsModalOpen(true);
    };

    const openEditModal = (course: Course) => {
        setEditingCourse(course);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: CoursePayload) => {
        try {
            if (editingCourse) {
                await updateCourse(editingCourse.id, data);
                alert('Cập nhật môn học thành công!');
            } else {
                await createCourse(data);
                alert('Thêm môn học thành công!');
            }
            setIsModalOpen(false);
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
            fetchCourses(1, searchTerm);
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

    const handleDeleteCourse = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa môn học này không?')) {
            try {
                await deleteCourse(id);
                alert('Xóa môn học thành công!');
                if (courses.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchCourses(currentPage, debouncedSearchTerm);
                }
            } catch (error) {
                alert('Lỗi: Không thể xóa môn học.');
                console.error(error);
            }
        }
    };

    const handleExportExcel = () => {
        alert('Xuất danh sách môn học ra Excel');
        // TODO: Implement export functionality
    };

    const handleImportExcel = () => {
        alert('Import môn học từ Excel');
        // TODO: Implement import functionality
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
                    Hiển thị {startItem} - {endItem} của {totalItems} môn học
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
            <CourseFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingCourse}
            />
            <div className="space-y-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">
                        Quản lý môn học
                    </h1>
                    <p className="text-[#717182] text-xl">
                        Quản lý thông tin môn học trong Trường Đại Học Thủy Lợi
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên môn học, tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    </div>


                    <button
                        onClick={handleImportExcel}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center font-semibold text-sm"
                    >
                        <FiUpload className="mr-2" />
                        Thêm bằng Excel
                    </button>

                    <button
                        onClick={handleExportExcel}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center font-semibold text-sm"
                    >
                        <FiDownload className="mr-2" />
                        Xuất dữ liệu
                    </button>

                    <button
                        onClick={openAddModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center font-semibold text-sm"
                    >
                        <FiPlus className="mr-2" />
                        Thêm môn học
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-700 p-4 border-b border-gray-200">
                        Danh sách môn học
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên môn học</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tín</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {courses.length > 0 ? (
                                        courses.map((course, index) => (
                                            <tr key={course.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {course.courseName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {course.credits}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-4">
                                                        <button
                                                            onClick={() => openEditModal(course)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Sửa"
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCourse(course.id)}
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
                                            <td colSpan={4} className="text-center py-6 text-gray-500">
                                                Không tìm thấy môn học nào.
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

export default CoursePage;
