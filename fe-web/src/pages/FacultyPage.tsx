const FacultyPage = () => {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khoa</h1>
                <p className="text-gray-600">
                    Quản lý thông tin các khoa trong trường Đại học Thủy Lợi
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Danh sách khoa
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="font-medium">Khoa Công nghệ thông tin</h3>
                            <p className="text-sm text-gray-500">Mã khoa: CNTT</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="font-medium">Khoa Kinh tế & Quản lý</h3>
                            <p className="text-sm text-gray-500">Mã khoa: KTQL</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="font-medium">Khoa Điện - Điện tử</h3>
                            <p className="text-sm text-gray-500">Mã khoa: ĐĐT</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyPage;
