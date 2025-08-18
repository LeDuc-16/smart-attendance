import React, { useState, useEffect, useCallback } from "react";
import {
    FiEdit,
    FiTrash2,
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
    getAllFaculties,
    getAllMajors,
    getAllClasses,
    type Student,
    type StudentPayload,
    type DropdownOption,
    type Faculty,
    type Major
} from "../api/apiStudent";

const StudentPage = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dropdown data
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [allMajors, setAllMajors] = useState<Major[]>([]); // Tất cả ngành
    const [filteredMajors, setFilteredMajors] = useState<Major[]>([]); // Ngành theo khoa được chọn
    const [classes, setClasses] = useState<DropdownOption[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
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
    const [formError, setFormError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [totalPages, setTotalPages] = useState(1);

    // Fetch dropdown options
    const fetchDropdownOptions = useCallback(async () => {
        try {
            console.log('Fetching dropdown options...');

            const [facultiesData, majorsData, classesData] = await Promise.all([
                getAllFaculties(),
                getAllMajors(),
                getAllClasses()
            ]);

            console.log('Fetched data:', {
                faculties: facultiesData,
                majors: majorsData,
                classes: classesData
            });

            setFaculties(facultiesData);
            setAllMajors(majorsData);
            setClasses(classesData);
        } catch (err) {
            console.error("Error fetching dropdown options:", err);
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
            setError("Không tải được danh sách sinh viên.");
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

                // Reset ngành nếu ngành hiện tại không thuộc khoa được chọn
                const currentMajorValid = majorsForSelectedFaculty.some(
                    major => major.majorName === formData.majorName
                );
                if (!currentMajorValid && formData.majorName) {
                    setFormData(prev => ({ ...prev, majorName: "" }));
                }
            }
        } else {
            setFilteredMajors([]);
            setFormData(prev => ({ ...prev, majorName: "" }));
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
        setFormError("");
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
        setFormError("");
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const required = ["studentCode", "studentName", "className", "facultyName", "majorName", "account", "email"];
        for (const key of required) {
            if (!formData[key as keyof StudentPayload]) {
                setFormError("Vui lòng điền đầy đủ thông tin bắt buộc.");
                return;
            }
        }
        if (!editingStudent && !formData.password) {
            setFormError("Mật khẩu là bắt buộc.");
            return;
        }
        try {
            if (editingStudent) {
                const { password, ...editPayload } = formData;
                await updateStudent(editingStudent.id, editPayload);
                alert("Cập nhật sinh viên thành công!");
            } else {
                await createStudent(formData);
                alert("Thêm sinh viên thành công!");
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.message || "Không thể thực hiện thao tác.";
            alert(`Lỗi: ${errorMessage}`);
        }
    };

    const handleDeleteStudent = async (id: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này không?")) {
            try {
                await deleteStudent(id);
                alert("Xóa sinh viên thành công!");
                fetchStudents();
            } catch (err) {
                alert("Lỗi: Không thể xóa sinh viên.");
            }
        }
    };

    const handleUploadImage = (student: Student) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                await uploadStudentImage(student.id, file);
                alert("Tải ảnh thành công!");
                fetchStudents();
            } catch (err) {
                alert("Lỗi khi tải ảnh.");
            }
        };
        input.click();
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const paginatedStudents = students.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center z-50 bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-semibold">
                                {editingStudent ? "Chỉnh sửa sinh viên" : "Thêm sinh viên mới"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                                <FiX size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block mb-1 font-medium">
                                        Mã sinh viên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="studentCode"
                                        value={formData.studentCode}
                                        onChange={handleFormChange}
                                        className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ví dụ: STU-001"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">
                                        Họ tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="studentName"
                                        value={formData.studentName}
                                        onChange={handleFormChange}
                                        className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>

                                {/* Dropdown Lớp */}
                                <div>
                                    <label className="block mb-1 font-medium">
                                        Lớp <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="className"
                                        value={formData.className}
                                        onChange={handleFormChange}
                                        className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Chọn lớp --</option>
                                        {classes.map((classOption) => (
                                            <option key={classOption.value} value={classOption.value}>
                                                {classOption.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dropdown Khoa */}
                                <div>
                                    <label className="block mb-1 font-medium">
                                        Khoa <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="facultyName"
                                        value={formData.facultyName}
                                        onChange={handleFormChange}
                                        className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Chọn khoa --</option>
                                        {faculties.map((faculty) => (
                                            <option key={faculty.id} value={faculty.facultyName}>
                                                {faculty.facultyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dropdown Ngành - Chỉ hiển thị ngành thuộc khoa đã chọn */}
                                <div>
                                    <label className="block mb-1 font-medium">
                                        Ngành <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="majorName"
                                        value={formData.majorName}
                                        onChange={handleFormChange}
                                        className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!formData.facultyName} // Disable nếu chưa chọn khoa
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
                                    {formData.facultyName && filteredMajors.length === 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Khoa này chưa có ngành nào.
                                        </p>
                                    )}
                                </div>

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
                                {!editingStudent && (
                                    <div>
                                        <label className="block mb-1 font-medium">
                                            Mật khẩu <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password || ""}
                                            onChange={handleFormChange}
                                            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Mật khẩu"
                                        />
                                    </div>
                                )}
                                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                            </div>
                            <div className="flex justify-end p-4 border-t">
                                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                                    {editingStudent ? "Lưu thay đổi" : "Thêm sinh viên"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Page Content - giữ nguyên phần table và pagination */}
            <div className="space-y-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">
                        Quản lý sinh viên
                    </h1>
                    <p className="text-[#717182] text-xl">
                        Quản lý thông tin sinh viên trong trường Đại học Thủy Lợi
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã sinh viên, họ tên..."
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
                        <FiPlus className="mr-2" /> Thêm sinh viên
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-700 p-4 border-b border-gray-200">
                        Danh sách sinh viên
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SV</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngành</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedStudents.length > 0 ? (
                                        paginatedStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.studentCode}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.studentName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.className || "-"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.facultyName || "-"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.majorName || "-"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <button onClick={() => openEditModal(student)} className="text-indigo-600 hover:text-indigo-900 p-1" title="Sửa">
                                                            <FiEdit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-900 p-1" title="Xóa">
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleUploadImage(student)} className="text-blue-600 hover:text-blue-900 p-1" title="Tải ảnh">
                                                            <FiUpload size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-6 text-gray-500">Không tìm thấy sinh viên nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 px-4 py-3">
                            <span className="text-sm text-gray-600">
                                Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, students.length)} của {students.length} sinh viên
                            </span>
                            <div className="flex items-center">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 mx-1 rounded-md bg-white text-gray-700 border border-gray-300 disabled:opacity-50 text-sm">
                                    &lt; Trước
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-1 mx-1 rounded-md text-sm font-medium ${currentPage === page ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}>
                                        {page}
                                    </button>
                                ))}
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 mx-1 rounded-md bg-white text-gray-700 border border-gray-300 disabled:opacity-50 text-sm">
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

export default StudentPage;
