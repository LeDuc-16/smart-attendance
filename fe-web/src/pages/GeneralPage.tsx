import DashboardCard from '../components/DashboardCard';
import bookIcon from '../assets/icons/book.png';


const menuItems = [
    { text: "Quản lý khoa", href: "/dashboard/faculty", icon: bookIcon },
    { text: "Quản lý ngành", href: "/dashboard/major", icon: bookIcon },
    { text: "Quản lý giảng viên", href: "/dashboard/lecturer", icon: bookIcon },
    { text: "Quản lý lớp học", href: "/dashboard/class", icon: bookIcon },
    { text: "Quản lý sinh viên", href: "/dashboard/student", icon: bookIcon },
    { text: "Quản lý môn học", href: "/dashboard/subject", icon: bookIcon },
    { text: "Quản lý phòng học", href: "/dashboard/classroom", icon: bookIcon },
    { text: "Quản lý lịch giảng dạy", href: "/dashboard/teaching", icon: bookIcon },
    { text: "Quản lý điểm danh", href: "/dashboard/attendance", icon: bookIcon },
];


const GeneralPage = () => {
    return (
        <div className="space-y-4">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">
                    Tổng quan hệ thống
                </h1>
                <p className="text-[#717182] text-xl">
                    Theo dõi và quản lý hoạt động điểm danh tại Trường Đại học Thủy Lợi
                </p>
            </div>

            {/* --- Sử dụng CSS Grid để tạo lưới --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Dùng hàm map để lặp qua mảng dữ liệu và render các card */}
                {menuItems.map((item) => (
                    <DashboardCard
                        key={item.text}
                        text={item.text}
                        href={item.href}
                        icon={item.icon}
                    />
                ))}
            </div>
        </div>
    );
};

export default GeneralPage;