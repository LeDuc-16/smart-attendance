import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MyButton from "../components/MyButton";
import MyInput from "../components/MyInput";
import { login } from "../api/apiAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(""); // Đổi từ email -> account
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(account, password);

      // Kiểm tra access_token trực tiếp từ response
      if (response && response.access_token) {
        // Chặn quyền sinh viên
        if (response.user?.role === "STUDENT") {
          setMessage("Bạn không có quyền truy cập hệ thống này!");
          setIsLoading(false);
          return;
        }
        setMessage("Đăng nhập thành công!");
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("refresh_token", response.refresh_token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Điều hướng cho giảng viên
        if (response.user?.role === "LECTURER") {
          navigate("/lecturer-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        console.log("API response:", response);
        setMessage("Không tìm thấy access_token trong phản hồi!");
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Đăng nhập thất bại. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue-200 flex justify-center items-center min-h-screen p-5">
      <div className="rounded flex shadow-xl overflow-hidden w-full max-w-3xl border border-gray-300">
        {/* Left side - Form */}
        <div className="w-2/3 p-5 bg-gray-50 justify-center flex flex-col">
          <h1 className="text-2xl flex justify-center font-semibold mb-4">
            Đăng nhập
          </h1>
          <form onSubmit={handleLogin}>
            <MyInput
              label="Mã tài khoản"
              placeholder="Nhập mã tài khoản của bạn"
              type="text"
              id="account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
            <MyInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu của bạn"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex items-center justify-between mb-4">
              <label className="inline-flex items-center text-sm text-gray-700">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2">Ghi nhớ tôi</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <MyButton title="Đăng nhập" type="submit" isLoading={isLoading} />

            {message && (
              <p
                className={`mt-2 text-center ${message.includes("thành công")
                  ? "text-green-500"
                  : "text-red-500"
                  }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>

        <div className="w-1/2 bg-blue-900 p-4 rounded h-150 justify-center flex flex-col text-white">
          <img
            src="https://www.tlu.edu.vn/Portals/0/2014/Logo-WRU.png"
            className="rounded-full object-cover mx-auto mb-4"
            alt="Logo TLU"
          />
          <h2 className="text-xl font-bold mb-2 text-center">
            Quản lý hệ thống điểm danh thông minh
          </h2>
          <p className="text-gray-200 text-center text-sm leading-relaxed">
            Dành riêng cho phòng đào tạo và giảng viên tại trường đại học Thủy
            Lợi để quản lý điểm danh sinh viên một cách hiệu quả và thông minh.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;