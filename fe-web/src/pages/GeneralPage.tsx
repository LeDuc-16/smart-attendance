const GeneralPage = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Tổng quan hệ thống
                </h1>
                <p className="text-gray-600">
                    Thống kê tổng quan về hệ thống điểm danh
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">
                                Tổng sinh viên
                            </h3>
                            <p className="text-2xl font-semibold text-gray-900">1,234</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">Giảng viên</h3>
                            <p className="text-2xl font-semibold text-gray-900">89</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12V6H4v10h12z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">Lớp học</h3>
                            <p className="text-2xl font-semibold text-gray-900">45</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">
                                Điểm danh hôm nay
                            </h3>
                            <p className="text-2xl font-semibold text-gray-900">892</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Hoạt động gần đây
                    </h2>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="ml-3 text-sm text-gray-600">
                                Lớp CNTT-K62 đã hoàn thành điểm danh môn Lập trình Web
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                                5 phút trước
                            </span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="ml-3 text-sm text-gray-600">
                                Giảng viên Nguyễn Văn A đã tạo lớp học mới
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                                15 phút trước
                            </span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="ml-3 text-sm text-gray-600">
                                Sinh viên có 12 trường hợp vắng mặt không phép
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                                30 phút trước
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralPage;
