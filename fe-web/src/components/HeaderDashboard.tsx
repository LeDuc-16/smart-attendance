import Dropdown from "./Dropdown";

const HeaderDashboard = () => {
    return (
        <header className="fixed top-0 h-24 bg-white border-b border-gray-300 shadow-sm z-10 w-full md:left-80 md:w-[calc(100%-20rem)]">
            <div className="px-4 flex items-center justify-between h-full">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800 flex">Tổng quan</h1>
                    <h5 className="text-sm text-gray-500">Thứ 5 ngày 31 tháng 7, 2025</h5>
                </div>

                <Dropdown
                    trigger={
                        <div className="flex items-center space-x-4">
                            <img
                                src="https://via.placeholder.com/40"
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="text-right">
                                <h2 className="text-sm font-semibold text-gray-800">Nguyễn Văn A</h2>
                                <p className="text-xs text-gray-500">Giảng viên</p>
                            </div>
                        </div>
                    }
                >
                    <div className="py-2">
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Hồ sơ cá nhân
                        </a>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Đăng xuất
                        </a>
                    </div>
                </Dropdown>
            </div>
        </header>
    );
};

export default HeaderDashboard;
