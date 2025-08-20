import React, { useState, useEffect, useCallback } from "react";
import {
    FiPlus,
    FiX,
    FiUpload,
    FiSearch
} from "react-icons/fi";
import {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    uploadStudentImage,
    importStudentsFromExcel,
    getAllFaculties,
    getAllMajors,
    getAllClasses,
    type Student,
    type StudentPayload,
    type DropdownOption,
    type Faculty,
    type Major,
} from "../api/apiStudent";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Function để chuyển đổi lỗi sang tiếng Việt
const getErrorMessageVN = (errorMessage: string): string => {
    const errorMap: { [key: string]: string } = {
        'Class capacity exceeded for class': 'Lớp đã đầy, không thể thêm thêm sinh viên',
        'Unauthorized': 'Bạn không có quyền truy cập',
        'Forbidden': 'Hành động bị cấm',
        'Not Found': 'Không tìm thấy tài nguyên',
        'ValidationError': 'Dữ liệu không hợp lệ',
        'Bad Request': 'Yêu cầu không hợp lệ',
        'Internal Server Error': 'Lỗi máy chủ nội bộ',
        'Network Error': 'Lỗi kết nối mạng',
        'Request failed': 'Yêu cầu thất bại',
        'timeout': 'Hết thời gian chờ',
        'duplicate': 'Dữ liệu đã tồn tại',
        'already exists': 'Đã tồn tại',
        'invalid': 'Không hợp lệ',
        'required': 'Trường bắt buộc'
    };

    for (const [key, value] of Object.entries(errorMap)) {
        if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }

    if (errorMessage.includes('capacity exceeded')) {
        const classMatch = errorMessage.match(/for class:\s*\[(.+?)\]/);
        const className = classMatch ? classMatch[1] : '';
        return `Lớp ${className} đã đầy, không thể thêm thêm sinh viên`;
    }

    return 'Có lỗi xảy ra. Vui lòng thử lại.';
};

// Student Card Component - ĐƠN GIẢN, KHÔNG DÙNG USEEFFECT
// Student Card Component - Với force reload ảnh
const StudentCard = ({
    student,
    onEdit,
    onDelete,
    onUpload
}: {
    student: Student;
    onEdit: () => void;
    onDelete: () => void;
    onUpload: () => void;
}) => {
    // Ảnh mặc định đơn giản bằng CSS
    const placeholderStyle = {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        fontSize: '12px',
        fontWeight: 'bold',
        border: '4px solid #dbeafe'
    };

    // Thêm timestamp để force reload ảnh
    const getImageUrl = (avatarUrl: string) => {
        return `${avatarUrl}?t=${Date.now()}`;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col items-center">
                <div className="relative mb-3">
                    {student.avatar ? (
                        <img
                            src={getImageUrl(student.avatar)}
                            alt={`${student.studentName} avatar`}
                            className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'flex';
                            }}
                        />
                    ) : null}

                    <div
                        style={{
                            ...placeholderStyle,
                            display: student.avatar ? 'none' : 'flex'
                        }}
                    >
                        Avatar
                    </div>

                    <button
                        onClick={onUpload}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition-colors"
                        title="Tải ảnh lên"
                    >
                        <FiUpload size={12} />
                    </button>
                </div>

                <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-[#1E3A8A] mb-1">
                        {student.studentCode}
                    </h3>
                    <p className="text-gray-800 font-medium mb-1 line-clamp-1">
                        {student.studentName}
                    </p>
                    <p className="text-gray-500 text-sm line-clamp-1">
                        {student.className || 'Chưa có lớp'}
                    </p>
                    <div className="flex flex-col text-xs text-gray-400 mt-1">
                        <span>{student.majorName || 'Chưa có ngành'}</span>
                        <span>{student.facultyName || 'Chưa có khoa'}</span>
                    </div>
                </div>

                <div className="flex space-x-2 w-full">
                    <button
                        onClick={onEdit}
                        className="flex-1 px-3 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors text-sm font-medium"
                        title="Chỉnh sửa"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                        title="Xóa"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};



// Modal Form Component
const StudentFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    formError,
    faculties,
    filteredMajors,
    classes,
    formData,
    onFormChange
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    initialData: Student | null;
    formError: string;
    faculties: Faculty[];
    filteredMajors: Major[];
    classes: DropdownOption[];
    formData: StudentPayload;
    onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start p-4">
                    <div>
                        <h3 className="text-xl font-semibold text-[#1E3A8A]">
                            {initialData ? 'Chỉnh sửa sinh viên' : 'Thêm mới'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {initialData
                                ? 'Sửa thông tin sinh viên.'
                                : 'Thêm thông tin sinh viên mới.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="p-6">
                        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                            <h4 className="font-semibold">Thông tin sinh viên</h4>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã sinh viên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="studentCode"
                                    value={formData.studentCode}
                                    onChange={onFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ví dụ: SV001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={onFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lớp <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="className"
                                    value={formData.className}
                                    onChange={onFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">-- Chọn lớp --</option>
                                    {classes.map((classOption) => (
                                        <option key={classOption.value} value={classOption.value}>
                                            {classOption.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Khoa <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="facultyName"
                                    value={formData.facultyName}
                                    onChange={onFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">-- Chọn khoa --</option>
                                    {faculties.map((faculty) => (
                                        <option key={faculty.id} value={faculty.facultyName}>
                                            {faculty.facultyName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngành <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="majorName"
                                    value={formData.majorName}
                                    onChange={onFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    disabled={!formData.facultyName}
                                >
                                    <option value="">
                                        {formData.facultyName ? "-- Chọn ngành --" : "-- Vui lòng chọn khoa trước --"}
                                    </option>
                                    {filteredMajors.map((major) => (
                                        <option key={major.id} value={major.majorName}>
                                            {major.majorName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tài khoản <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="account"
                                    value={formData.account}
                                    onChange={onFormChange}
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
                                    onChange={onFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="example@email.com"
                                />
                            </div>

                            {!initialData && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mật khẩu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password || ""}
                                        onChange={onFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Mật khẩu"
                                    />
                                </div>
                            )}

                            {formError && (
                                <p className="text-red-500 text-sm mt-2">{formError}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end p-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                        >
                            {initialData ? 'Lưu thay đổi' : 'Thêm sinh viên mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    studentName,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    studentName: string;
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
                            <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa sinh viên</h2>
                            <div className="text-gray-400 text-base font-medium">Hành động không thể hoàn tác</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                        <FiX size={24} />
                    </button>
                </div>
                <div className="px-6 pb-0 pt-4">
                    <span className="text-base text-gray-500">
                        Bạn có chắc chắn muốn xóa sinh viên <span className="font-bold text-black">{studentName}</span> khỏi hệ thống?
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
                        Xóa sinh viên
                    </button>
                </div>
            </div>
        </div>
    );
};

// Import Excel Modal
const ImportExcelModal = ({
    isOpen,
    onClose,
    onSubmit,
    classes
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (file: File, className: string) => void;
    classes: { value: string, label: string }[];
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedClass, setSelectedClass] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile && selectedClass) {
            onSubmit(selectedFile, selectedClass);
            setSelectedFile(null);
            setSelectedClass('');
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setSelectedClass('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start p-4">
                    <div>
                        <h3 className="text-xl font-semibold text-[#1E3A8A]">
                            Import sinh viên từ Excel
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Chọn file Excel (.xlsx hoặc .xls) và lớp cho toàn bộ danh sách sinh viên.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            File Excel phải có các cột: studentCode, studentName, account, email, password, majorName, facultyName
                        </p>
                    </div>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Chọn file Excel <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Chọn lớp <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">-- Chọn lớp --</option>
                                {classes.map((cls) => (
                                    <option key={cls.value} value={cls.value}>
                                        {cls.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end p-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold mr-2"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedFile || !selectedClass}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Import sinh viên
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main StudentPage Component
const StudentPage = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dropdown data
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [allMajors, setAllMajors] = useState<Major[]>([]);
    const [filteredMajors, setFilteredMajors] = useState<Major[]>([]);
    const [classes, setClasses] = useState<DropdownOption[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [modalError, setModalError] = useState('');

    // Delete modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

    // Import modal states
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [formData, setFormData] = useState<StudentPayload>({
        className: "",
        studentCode: "",
        studentName: "",
        account: "",
        email: "",
        password: "",
        facultyName: "",
        majorName: "",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [totalPages, setTotalPages] = useState(1);

    const showSuccessToast = useCallback((message: string) => {
        toast.success(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    }, []);

    const showErrorToast = useCallback((message: string) => {
        toast.error(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    }, []);

    // Fetch dropdown options - chạy một lần duy nhất
    useEffect(() => {
        const fetchDropdownOptions = async () => {
            try {
                const [facultiesData, majorsData, classesData] = await Promise.all([
                    getAllFaculties(),
                    getAllMajors(),
                    getAllClasses()
                ]);

                setFaculties(facultiesData);
                setAllMajors(majorsData);
                setClasses(classesData);
            } catch (err: any) {
                console.error("Error fetching dropdown options:", err);
                const serverError = err.response?.data?.message || err.message || 'Không thể tải dữ liệu dropdown';
                const errorMessageVN = getErrorMessageVN(serverError);
                showErrorToast(errorMessageVN);
            }
        };

        fetchDropdownOptions();
    }, [showErrorToast]);

    // Fetch students - phụ thuộc vào debouncedSearchTerm
    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);
            try {
                let data: Student[] = await getStudents();
                if (debouncedSearchTerm) {
                    data = data.filter(
                        (s) =>
                            s.studentCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                            s.studentName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                    );
                }
                setStudents(data);
                setTotalPages(Math.ceil(data.length / itemsPerPage));
            } catch (err: any) {
                console.error("Error fetching students:", err);
                const serverError = err.response?.data?.message || err.message || 'Không tải được danh sách sinh viên';
                const errorMessageVN = getErrorMessageVN(serverError);
                setError(errorMessageVN);
                showErrorToast(errorMessageVN);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [debouncedSearchTerm, showErrorToast]);

    // Debounced search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Major filtering - LOẠI BỎ formData.majorName
    useEffect(() => {
        if (formData.facultyName && allMajors.length > 0 && faculties.length > 0) {
            const selectedFaculty = faculties.find(f => f.facultyName === formData.facultyName);
            if (selectedFaculty) {
                const majorsForSelectedFaculty = allMajors.filter(
                    major => major.facultyId === selectedFaculty.id
                );
                setFilteredMajors(majorsForSelectedFaculty);

                // Chỉ reset khi major không hợp lệ
                const currentMajorValid = majorsForSelectedFaculty.some(
                    major => major.majorName === formData.majorName
                );
                if (!currentMajorValid && formData.majorName) {
                    setFormData(prev => ({ ...prev, majorName: "" }));
                }
            }
        } else {
            setFilteredMajors([]);
        }
    }, [formData.facultyName, allMajors, faculties]);

    const openAddModal = () => {
        setEditingStudent(null);
        setFormData({
            className: "",
            studentCode: "",
            studentName: "",
            account: "",
            email: "",
            password: "",
            facultyName: "",
            majorName: "",
        });
        setFilteredMajors([]);
        setModalError("");
        setIsModalOpen(true);
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            className: student.className || "",
            studentCode: student.studentCode,
            studentName: student.studentName,
            account: student.account,
            email: student.email,
            facultyName: student.facultyName || "",
            majorName: student.majorName || "",
        });
        setModalError("");
        setIsModalOpen(true);
    };

    const openDeleteModal = (student: Student) => {
        setDeletingStudent(student);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletingStudent(null);
        setIsDeleteModalOpen(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setModalError("");
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const required = ["studentCode", "studentName", "className", "facultyName", "majorName", "account", "email"];

        for (const key of required) {
            if (!formData[key as keyof StudentPayload]) {
                setModalError("Vui lòng điền đầy đủ thông tin bắt buộc.");
                return;
            }
        }

        if (!editingStudent && !formData.password) {
            setModalError("Mật khẩu là bắt buộc.");
            return;
        }

        try {
            if (editingStudent) {
                const { password, ...editPayload } = formData;
                await updateStudent(editingStudent.id, editPayload);
                showSuccessToast("Cập nhật sinh viên thành công!");
            } else {
                await createStudent(formData);
                showSuccessToast("Thêm sinh viên thành công!");
            }
            setIsModalOpen(false);

            // Trigger re-fetch bằng cách reset search
            setDebouncedSearchTerm(prev => prev + " ");
            setTimeout(() => setDebouncedSearchTerm(searchTerm), 100);
        } catch (err: any) {
            console.error("Error submitting form:", err);
            const serverError = err.response?.data?.message || err.message || 'Không thể thực hiện thao tác.';
            const errorMessageVN = getErrorMessageVN(serverError);
            setModalError(errorMessageVN);
            showErrorToast(errorMessageVN);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingStudent) return;

        try {
            await deleteStudent(deletingStudent.id);
            showSuccessToast('Xóa sinh viên thành công!');
            closeDeleteModal();

            if (students.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }

            // Trigger re-fetch bằng cách reset search
            setDebouncedSearchTerm(prev => prev + " ");
            setTimeout(() => setDebouncedSearchTerm(searchTerm), 100);
        } catch (error: any) {
            console.error("Error deleting student:", error);
            const serverError = error.response?.data?.message || error.message || 'Không thể xóa sinh viên.';
            const errorMessageVN = getErrorMessageVN(serverError);
            showErrorToast(errorMessageVN);
            closeDeleteModal();
        }
    };

    const handleUploadImage = (student: Student) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                showErrorToast("Kích thước ảnh không được vượt quá 5MB");
                return;
            }

            try {
                await uploadStudentImage(student.id, file);
                showSuccessToast("Tải ảnh thành công!");

                // FORCE UPDATE: Reload toàn bộ danh sách sinh viên để lấy URL ảnh mới
                const updatedStudents = await getStudents();

                // Filter nếu có search term
                let filteredData = updatedStudents;
                if (debouncedSearchTerm) {
                    filteredData = updatedStudents.filter(
                        (s) =>
                            s.studentCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                            s.studentName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                    );
                }

                setStudents(filteredData);
                setTotalPages(Math.ceil(filteredData.length / itemsPerPage));

            } catch (err: any) {
                console.error("Error uploading image:", err);
                const serverError = err.response?.data?.message || err.message || 'Lỗi khi tải ảnh';
                const errorMessageVN = getErrorMessageVN(serverError);
                showErrorToast(errorMessageVN);
            }
        };
        input.click();
    };


    const handleImportExcel = async (file: File, className: string) => {
        try {
            setLoading(true);
            await importStudentsFromExcel(file, className);
            showSuccessToast("Import sinh viên từ Excel thành công!");
            setIsImportModalOpen(false);

            // Trigger re-fetch bằng cách reset search
            setDebouncedSearchTerm(prev => prev + " ");
            setTimeout(() => setDebouncedSearchTerm(searchTerm), 100);
        } catch (err: any) {
            console.error("Error importing Excel:", err);
            const serverError = err.response?.data?.message || err.message || 'Lỗi khi import Excel';
            const errorMessageVN = getErrorMessageVN(serverError);
            showErrorToast(errorMessageVN);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        let pages: number[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            pages = [1, 2, 3, 4, 5];
        } else if (currentPage >= totalPages - 2) {
            pages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
        }

        const startItem = students.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
        const endItem = Math.min(currentPage * itemsPerPage, students.length);

        return (
            <div className="bg-white border-t border-gray-200 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-2 md:mb-0">
                    <p className="text-sm text-gray-700">
                        Hiển thị <span className="font-medium">{startItem}</span> đến{' '}
                        <span className="font-medium">{endItem}</span> trong{' '}
                        <span className="font-medium">{students.length}</span> kết quả
                    </p>
                </div>
                <div>
                    <nav className="inline-flex gap-1" aria-label="Pagination">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="border px-3 py-1 rounded-l-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span aria-hidden="true">&lt;</span>
                        </button>
                        {pages.map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`border px-3 py-1 ${currentPage === page
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="border px-3 py-1 rounded-r-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span aria-hidden="true">&gt;</span>
                        </button>
                    </nav>
                </div>
            </div>
        );
    };

    const paginatedStudents = students.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            <ToastContainer />
            <StudentFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setModalError('');
                }}
                onSubmit={handleFormSubmit}
                initialData={editingStudent}
                formError={modalError}
                faculties={faculties}
                filteredMajors={filteredMajors}
                classes={classes}
                formData={formData}
                onFormChange={handleFormChange}
            />
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                studentName={deletingStudent?.studentName || ''}
            />
            <ImportExcelModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSubmit={handleImportExcel}
                classes={classes}
            />

            <div className="space-y-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">
                        Quản lý sinh viên
                    </h1>
                    <p className="text-[#717182] text-xl">
                        Quản lý thông tin sinh viên trong trường Đại học Thủy Lợi
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative flex-grow w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã sinh viên, họ tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center font-semibold text-sm"
                        >
                            <FiUpload className="mr-2" />
                            Thêm bằng Excel
                        </button>

                        <button
                            onClick={openAddModal}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center font-semibold text-sm"
                        >
                            <FiPlus className="mr-2" /> Thêm sinh viên
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-[#1E3A8A]">
                            Danh sách sinh viên
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
                        </div>
                    ) : error ? (
                        <p className="p-8 text-center text-red-600">{error}</p>
                    ) : paginatedStudents.length > 0 ? (
                        <>
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                    {paginatedStudents.map((student) => (
                                        <StudentCard
                                            key={student.id}
                                            student={student}
                                            onEdit={() => openEditModal(student)}
                                            onDelete={() => openDeleteModal(student)}
                                            onUpload={() => handleUploadImage(student)}
                                        />
                                    ))}
                                </div>
                            </div>
                            {renderPagination()}
                        </>
                    ) : (
                        <p className="p-8 text-center text-gray-500">Không tìm thấy sinh viên nào.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default StudentPage;
