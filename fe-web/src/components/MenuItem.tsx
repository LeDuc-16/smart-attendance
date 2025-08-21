<<<<<<< HEAD
import React from 'react';
import { NavLink } from 'react-router-dom';

interface MenuItemProps {
    icon: React.ElementType | string;
    text: string;
    href: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, text, href }) => {

    const renderIcon = () => {
        if (!Icon) return null;
        const iconClasses = "mr-2 w-5 h-5";
        if (typeof Icon === 'string') {
            return <img src={Icon} alt="" className={iconClasses} />;
        }
        return <Icon className={iconClasses} />;
    };

    return (
        <li>
            <NavLink
                to={href}
                className={({ isActive }) => {
                    const baseClasses = "flex items-center p-2 rounded-xl transition-colors duration-200 text-white border-2 border-[#CED4DA] mb-5";

                    if (isActive) {
                        return `${baseClasses} bg-[#00509E]`;
                    }

                    return `${baseClasses} hover:bg-blue-600`;
                }}
            >
                {renderIcon()}
                <span>{text}</span>
            </NavLink>
        </li>
    );
=======
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
>>>>>>> 0613f4f1dda44d5ae357617c15b1bee095de8123
};

export default MenuItem;