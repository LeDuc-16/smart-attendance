import React from 'react';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
    icon: React.ElementType | string;
    text: string;
    href: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon: Icon, text, href }) => {

    const renderIcon = () => {
        if (!Icon) return null;


        const iconClasses = "w-12 h-12 text-white mb-4";

        if (typeof Icon === 'string') {
            return <img src={Icon} alt="" className={iconClasses} />;
        }

        return <Icon className={iconClasses} fill="currentColor" />;
    };

    return (
        <Link
            to={href}
            className="block bg-blue-500 rounded-lg shadow-md p-6 text-center text-white font-semibold 
                       hover:bg-blue-600 transition-all duration-300 ease-in-out
                       transform hover:-translate-y-1"
        >
            <div className="flex flex-col items-center justify-center h-full">
                {renderIcon()}
                <span>{text}</span>
            </div>
        </Link>
    );
};

export default DashboardCard;