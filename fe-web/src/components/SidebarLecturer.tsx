
import React, { useState } from "react";
import { Link } from "react-router-dom";
import skyLineIcon from '../assets/icons/skyline.png';
import booksIcon from '../assets/icons/books.png';
import calenderIcon from '../assets/icons/calendar.png';
import accountIcon from '../assets/icons/account.png';

interface SidebarLecturerProps {
    activeTab?: string;
    setActiveTab?: (tab: string) => void;
}


const SidebarLecturer: React.FC<SidebarLecturerProps> = ({ activeTab, setActiveTab }) => {
        const [isOpen, setIsOpen] = useState<boolean>(false);
        const toggleSidebar = () => {
                setIsOpen(!isOpen);
        };

    return (
        <>
            {/* Toggle Button for Mobile */}
            <button
                onClick={toggleSidebar}
                className="md:hidden p-2 text-white bg-[#003366] rounded fixed top-4 left-4 z-20"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16m-7 6h7"
                    />
                </svg>
            </button>

            <div
                className={`fixed top-0 left-0 h-screen bg-[#003366] text-white transition-all duration-300 ease-in-out z-10
                    ${isOpen ? "w-80 p-4 visible" : "w-0 p-0 overflow-hidden invisible "}
                    md:w-80 md:p-4 md:visible md:static md:flex md:flex-col`}
            >
                <div className="p-1 bg-[#003366] rounded-lg flex items-center gap-4">
                    <img
                        src="https://www.tlu.edu.vn/Portals/0/2014/Logo-WRU.png"
                        alt="Logo"
                        className="w-15 h-10"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'https://placehold.co/72x64/FFFFFF/003366?text=TLU';
                        }}
                    />
                    <div className="flex-1">
                        <h2 className="text-sm font-bold text-white">
                            TRƯỜNG ĐẠI HỌC THỦY LỢI
                        </h2>
                        <p className="text-sm font-bold text-gray-300">
                            HỆ THỐNG ĐIỂM DANH
                        </p>
                    </div>
                </div>
                <hr className=" border-white-300 my-3 mb-5" />

                {/* Menu Items */}
                <nav className="flex-1">
                    <ul className="space-y-2">
                        <li>
                            <Link
                                to="/lecturer-dashboard"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-md font-semibold transition-colors duration-200 ${activeTab === 'dashboard' ? 'bg-blue-700 text-white' : 'hover:bg-blue-800 text-blue-200'}`}
                                onClick={() => setActiveTab && setActiveTab('dashboard')}
                            >
                                <img src={skyLineIcon} alt="icon" className="w-6 h-6" /> Trang chủ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/teaching-schedule"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-md font-semibold transition-colors duration-200 ${activeTab === 'teaching-schedule' ? 'bg-blue-700 text-white' : 'hover:bg-blue-800 text-blue-200'}`}
                                onClick={() => setActiveTab && setActiveTab('teaching-schedule')}
                            >
                                <img src={calenderIcon} alt="icon" className="w-6 h-6" /> Lịch giảng dạy
                            </Link>
                        </li>
                        <li className="flex items-center gap-3 px-4 py-2.5 rounded-md hover:bg-blue-800 text-blue-200 cursor-pointer">
                            <img src={accountIcon} alt="icon" className="w-6 h-6" /> Điểm danh
                        </li>
                        <li className="flex items-center gap-3 px-4 py-2.5 rounded-md hover:bg-blue-800 text-blue-200 cursor-pointer">
                            <img src={booksIcon} alt="icon" className="w-6 h-6" /> Báo cáo
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Overlay for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-0 md:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
};

export default SidebarLecturer;
