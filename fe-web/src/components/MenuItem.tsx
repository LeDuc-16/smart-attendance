// components/MenuItem.js
import React from 'react';
import { Link } from 'react-router-dom';

interface MenuItemProps {
    icon: string; // Kiểu string cho icon (ví dụ: emoji hoặc ký tự)
    text: string; // Kiểu string cho văn bản
    href: string; // Kiểu string cho đường dẫn
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, href }) => {
    return (
        <li>
            <Link
                to={href}
                className="flex items-center p-2 rounded-xl hover:bg-blue-600 transition-colors duration-200 text-white border-2 mb-5"
            >
                <span className="mr-2 text-lg">{icon}</span>
                <span>{text}</span>
            </Link>
        </li>
    );
};

export default MenuItem;