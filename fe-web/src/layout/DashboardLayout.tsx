import { Outlet } from "react-router-dom";
import HeaderDashboard from "../components/HeaderDashboard";
import Sidebar from "../components/Sidebar";

const DashboardLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <HeaderDashboard />
                <main className="flex-1 p-6 mt-20 md:mt-18">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
