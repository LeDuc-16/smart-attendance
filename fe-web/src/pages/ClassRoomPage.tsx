import React, { useState, useEffect, useCallback } from "react";
import {
    FiEdit,
    FiTrash2,
    FiPlus,
    FiX,
    FiSearch
} from "react-icons/fi";
import {
    getClassRooms,
    createClassRoom,
    updateClassRoom,
    deleteClassRoom,
    type ClassRoom,
    type ClassRoomPayload
} from "../api/apiClassRoom";

// Modal Form Component
const ClassRoomFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ClassRoomPayload) => void;
    initialData: ClassRoom | null;
}) => {
    const [formData, setFormData] = useState<ClassRoomPayload>({
        roomCode: "",
        locations: "",
    });
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    roomCode: initialData.roomCode,
                    locations: initialData.locations,
                });
            } else {
                setFormData({ roomCode: "", locations: "" });
            }
            setFormError("");
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.roomCode || !formData.locations) {
            setFormError('Vui lòng điền đầy đủ thông tin.');
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
                            {initialData ? 'Chỉnh sửa phòng học' : 'Thêm phòng học mới'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Thêm thông tin phòng học mới.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FiX size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                            <h4 className="font-semibold">Thông tin phòng học</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã phòng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="roomCode"
                                    value={formData.roomCode}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ví dụ: A101"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Địa điểm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="locations"
                                    value={formData.locations}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ví dụ: Tòa A - Tầng 1"
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
                            {initialData ? 'Lưu thay đổi' : 'Thêm phòng học mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main ClassRoomPage Component
const ClassRoomPage = () => {
    const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClassRoom, setEditingClassRoom] = useState<ClassRoom | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number>(0);
    const itemsPerPage = 5;

    const fetchClassRooms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data: ClassRoom[] = await getClassRooms();
            if (debouncedSearchTerm) {
                data = data.filter((room) =>
                    room.roomCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    room.locations.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                );
            }
            setClassRooms(data);
            setTotalItems(data.length);
            setTotalPages(Math.ceil(data.length / itemsPerPage));
        } catch (err) {
            console.error(err);
            setError("Không tải được danh sách phòng học.");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchClassRooms();
    }, [fetchClassRooms]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const openAddModal = () => {
        setEditingClassRoom(null);
        setIsModalOpen(true);
    };

    const openEditModal = (classRoom: ClassRoom) => {
        setEditingClassRoom(classRoom);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: ClassRoomPayload) => {
        try {
            if (editingClassRoom) {
                await updateClassRoom(editingClassRoom.id, data);
                alert('Cập nhật phòng học thành công!');
            } else {
                await createClassRoom(data);
                alert('Thêm phòng học thành công!');
            }
            setIsModalOpen(false);
            fetchClassRooms();
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

    const handleDeleteClassRoom = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phòng học này không?')) {
            try {
                await deleteClassRoom(id);
                alert('Xóa phòng học thành công!');
                if (classRooms.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchClassRooms();
                }
            } catch (error) {
                alert('Lỗi: Không thể xóa phòng học.');
                console.error(error);
            }
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const paginatedClassRooms = classRooms.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                    Hiển thị {startItem} - {endItem} của {totalItems} phòng học
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
            <ClassRoomFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingClassRoom}
            />
            <div className="space-y-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">
                        Quản lý phòng học
                    </h1>
                    <p className="text-[#717182] text-xl">
                        Quản lý thông tin phòng học trong trường Đại học Thủy Lợi
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã phòng, địa điểm..."
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
                        Thêm phòng học
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-700 p-4 border-b border-gray-200">
                        Danh sách phòng học
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
                                            Mã phòng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Địa điểm
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedClassRooms.length > 0 ? (
                                        paginatedClassRooms.map((classRoom, index) => (
                                            <tr key={classRoom.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {classRoom.roomCode}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {classRoom.locations}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-4">
                                                        <button
                                                            onClick={() => openEditModal(classRoom)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Sửa"
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClassRoom(classRoom.id)}
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
                                                Không tìm thấy phòng học nào.
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

export default ClassRoomPage;
