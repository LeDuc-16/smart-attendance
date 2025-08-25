
import React, { useState } from "react";
import MenuItem from "./MenuItem";
import skyLineIcon from '../assets/icons/skyline.png';
import schoolIcon from '../assets/icons/school.png';
import graduatesIcon from '../assets/icons/graduates.png';
import graduateIcon from '../assets/icons/graduate.png';
import buildingIcon from '../assets/icons/building.png';
import audienceIcon from '../assets/icons/audience.png';
import booksIcon from '../assets/icons/books.png';
import classroomIcon from '../assets/icons/classroom.png';
import calenderIcon from '../assets/icons/calendar.png';
import accountIcon from '../assets/icons/account.png';
interface SidebarProps { }

const Sidebar: React.FC<SidebarProps> = () => {
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
        <div

          className="p-1 bg-[#003366] rounded-lg flex items-center gap-4"
        >
          <img
            src="https://www.tlu.edu.vn/Portals/0/2014/Logo-WRU.png"
            alt="Logo"
            className="w-18 h-16"
          />
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white">
              TRƯỜNG ĐẠI HỌC THỦY LỢI
            </h2>
            <p

              className="text-sm font-bold text-gray-300"
            >
              HỆ THỐNG ĐIỂM DANH
            </p>
          </div>
        </div>
        <hr className=" border-white-300 my-3 mb-5" />

        {/* Menu Items */}
        <nav className="flex-1">
          <ul className="space-y-2">
            <MenuItem icon={skyLineIcon} text="Tổng quan" href="/dashboard/general" />
            <MenuItem icon={schoolIcon} text="Quản lý khoa" href="/dashboard/faculty" />
            <MenuItem icon={graduatesIcon} text="Quản lý ngành" href="/dashboard/major" />
            <MenuItem icon={graduateIcon} text="Quản lý giảng viên" href="/dashboard/lecturer" />
            <MenuItem icon={buildingIcon} text="Quản lý lớp học" href="/dashboard/class" />
            <MenuItem icon={audienceIcon} text="Quản lý sinh viên" href="/dashboard/student" />
            <MenuItem icon={booksIcon} text="Quản lý môn học" href="/dashboard/subject" />
            <MenuItem icon={classroomIcon} text="Quản lý phòng học" href="/dashboard/classroom" />
            <MenuItem icon={calenderIcon} text="Quản lý giảng dạy" href="/dashboard/teaching" />
            <MenuItem icon={accountIcon} text="Quản lý điểm danh" href="/dashboard/attendance" />
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

export default Sidebar;