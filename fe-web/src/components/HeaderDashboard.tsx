import Dropdown from "./Dropdown";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import avt from '../assets/icons/avt.png';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: { [key: string]: string } = {
    '/dashboard': 'Tổng quan',
    '/dashboard/general': 'Tổng quan',
    '/dashboard/faculty': 'Quản lý khoa',
    '/dashboard/major': 'Quản lý ngành',
    '/dashboard/lecturer': 'Quản lý giảng viên',
    '/dashboard/class': 'Quản lý lớp học',
    '/dashboard/student': 'Quản lý sinh viên',
    '/dashboard/subject': 'Quản lý môn học',
    '/dashboard/classroom': 'Quản lý phòng học',
    '/dashboard/teaching': 'Quản lý giảng dạy',
    '/dashboard/attendance': 'Quản lý điểm danh',
    // Thêm các trang khác nếu có
};

const HeaderDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    const location = useLocation();

    const currentTitle = pageTitles[location.pathname] || 'Trang không xác định';

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const day = days[date.getDay()];
        const dateNum = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}, ${dateNum} tháng ${month} năm ${year}`;
    };

    return (
        <header className="fixed top-0 h-18 bg-white border-b border-gray-300 shadow-sm z-10 w-full md:left-80 md:w-[calc(100%-20rem)]">
            <div className="px-4 flex items-center justify-between h-full">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800 flex">{currentTitle}</h1>
                    <h5 className="text-sm text-gray-500">{formatDate(currentTime)}</h5>
                </div>

                <div className="flex items-center space-x-4">
                    <img
                        src={avt}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="text-right">
                        <h2 className="text-sm font-semibold text-gray-800">Hoàng Quang Vinh</h2>
                        <p className="text-xs text-gray-500">Quản trị viên</p>
                    </div>
                    <Dropdown
                        trigger={
                            <button className="p-1 hover:bg-gray-100 rounded-full">
                                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                            </button>
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
                                href="/login"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Đăng xuất
                            </a>
                        </div>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
};

export default HeaderDashboard;