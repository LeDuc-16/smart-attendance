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
    getStudentImage,
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

// Student Card Component
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
    const [imageUrl, setImageUrl] = useState<string>('https://via.placeholder.com/150x150/cccccc/ffffff?text=Avatar');

    // Load ảnh sinh viên khi component mount
    useEffect(() => {
        const loadStudentImage = async () => {
            if (student.avatar) {
                setImageUrl(student.avatar);
            } else {
                try {
                    const url = await getStudentImage(student.id);
                    setImageUrl(url);
                } catch (error) {
                    setImageUrl('https://via.placeholder.com/150x150/cccccc/ffffff?text=Avatar');
                }
            }
        };

        loadStudentImage();
    }, [student.id, student.avatar]);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Avatar */}
            <div className="flex flex-col items-center">
                <div className="relative">
                    <img
                        src={imageUrl}
                        alt={`${student.studentName} avatar`}
                        className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 mb-3"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/150x150/cccccc/ffffff?text=Avatar';
                        }}
                    />

                    {/* Upload button overlay */}
                    <button
                        onClick={onUpload}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition-colors"
                        title="Tải ảnh lên"
                    >
                        <FiUpload size={12} />
                    </button>
                </div>

                {/* Student Info */}
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

                {/* Action Buttons */}
                <div className="flex space-x-2 w-full">
                    <button
                        onClick={onEdit}
                        className="flex-1 px-3 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors text-sm font-medium"
                        title="Chỉnh sửa"
                    >
                        Update
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                        title="Xóa"
                    >
                        Delete
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

// Import Excel Modal được cập nhật hoàn chỉnh
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
    const itemsPerPage = 20;
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

    // Fetch dropdown options
    const fetchDropdownOptions = useCallback(async () => {
        try {
            const [facultiesData, majorsData, classesData] = await Promise.all([
                getAllFaculties(),
                getAllMajors(),
                getAllClasses()
            ]);

            setFaculties(facultiesData);
            setAllMajors(majorsData);
            setClasses(classesData);
        } catch (err) {
            console.error("Error fetching dropdown options:", err);
            showErrorToast("Không thể tải dữ liệu dropdown");
        }
    }, []);

    const fetchStudents = useCallback(async () => {
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
        } catch (err) {
            console.error("Error fetching students:", err);
            setError("Không tải được danh sách sinh viên.");
            showErrorToast("Không tải được danh sách sinh viên");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchStudents();
        fetchDropdownOptions();
    }, [fetchStudents, fetchDropdownOptions]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Logic cascade: Khi chọn khoa, filter ngành theo khoa đó
    useEffect(() => {
        if (formData.facultyName && allMajors.length > 0) {
            const selectedFaculty = faculties.find(f => f.facultyName === formData.facultyName);
            if (selectedFaculty) {
                const majorsForSelectedFaculty = allMajors.filter(
                    major => major.facultyId === selectedFaculty.id
                );
                setFilteredMajors(majorsForSelectedFaculty);

                const currentMajorValid = majorsForSelectedFaculty.some(
                    major => major.majorName === formData.majorName
                );
                if (!currentMajorValid && formData.majorName) {
                    setFormData(prev => ({ ...prev, majorName: "" }));
                }
            }
        } else {
            setFilteredMajors([]);
            if (formData.majorName) {
                setFormData(prev => ({ ...prev, majorName: "" }));
            }
        }
    }, [formData.facultyName, allMajors, faculties, formData.majorName]);

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
            fetchStudents();
        } catch (err: any) {
            console.error("Error submitting form:", err);
            const errorMessage = err.response?.data?.message || "Không thể thực hiện thao tác.";
            setModalError(errorMessage);
            showErrorToast(errorMessage);
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
            } else {
                fetchStudents();
            }
        } catch (error: any) {
            console.error("Error deleting student:", error);
            const errorMessage = error.response?.data?.message || 'Không thể xóa sinh viên.';
            showErrorToast(errorMessage);
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

            // Kiểm tra kích thước file (giới hạn 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showErrorToast("Kích thước ảnh không được vượt quá 5MB");
                return;
            }

            try {
                await uploadStudentImage(student.id, file);
                showSuccessToast("Tải ảnh thành công!");
                fetchStudents();
            } catch (err: any) {
                console.error("Error uploading image:", err);
                const errorMessage = err.response?.data?.message || "Lỗi khi tải ảnh";
                showErrorToast(errorMessage);
            }
        };
        input.click();
    };

    const handleImportExcel = async (file: File, className?: string) => {
        try {
            setLoading(true);
            await importStudentsFromExcel(file, className);
            showSuccessToast("Import sinh viên từ Excel thành công!");
            setIsImportModalOpen(false);
            fetchStudents();
        } catch (err: any) {
            console.error("Error importing Excel:", err);
            const errorMessage = err.response?.data?.message || "Lỗi khi import Excel";
            showErrorToast(errorMessage);
        } finally {
            setLoading(false);
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

        const startItem = students.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
        const endItem = Math.min(currentPage * itemsPerPage, students.length);

        return (
            <div className="flex items-center justify-between mt-6 px-4 py-3">
                <span className="text-sm text-gray-600">
                    Hiển thị {startItem} - {endItem} của {students.length} sinh viên
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

            {/* Page Content */}
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
                            {totalPages > 1 && renderPagination()}
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
