import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HeaderLecturer: React.FC<{ lecturerName: string }> = ({ lecturerName }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("token");
    setIsDropdownOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex items-center justify-end px-8 py-4 bg-white relative" ref={dropdownRef}>
      <img
        src="https://randomuser.me/api/portraits/men/32.jpg"
        alt="Avatar"
        className="w-10 h-10 rounded-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = "https://placehold.co/40x40/FFFFFF/0B2D5B?text=GV";
        }}
      />
      <div className="flex flex-col text-right ml-3">
        <span className="font-semibold">{lecturerName}</span>
        <span className="text-xs text-gray-500">Giảng viên</span>
      </div>
      <button
        className="ml-2 p-2 rounded-full hover:bg-gray-200"
        onClick={() => setIsDropdownOpen((open) => !open)}
        aria-label="Mở menu tài khoản"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path
            d="M7 10l5 5 5-5"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 top-14 bg-white shadow-lg rounded w-40 z-10 border">
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </header>
  );
};

export default HeaderLecturer;
