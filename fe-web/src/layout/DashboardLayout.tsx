import { Outlet } from "react-router-dom";
import HeaderDashboard from "../components/HeaderDashboard";
import Sidebar from "../components/Sidebar";

const DashboardLayout: React.FC = () => {
<<<<<<< HEAD
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
=======
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <HeaderDashboard />
        <main className="flex-1 p-6 mt-20 md:mt-24">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
>>>>>>> 0613f4f1dda44d5ae357617c15b1bee095de8123
};

export default DashboardLayout;
