import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MyButton from "../components/MyButton";
import MyInput from "../components/MyInput";
import { forgotPassword } from "../api/apiAuth";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (!email || !email.trim()) {
            setMessage("Vui lòng nhập địa chỉ email!");
            setIsLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage("Vui lòng nhập địa chỉ email hợp lệ!");
            setIsLoading(false);
            return;
        }

        try {
            const response = await forgotPassword(email);
            console.log("✅ Success Response:", response);

            setMessage("Mã OTP đã được gửi về email của bạn!");
            setIsSuccess(true);

        } catch (error: any) {
            console.error("❌ Error occurred:", error);

            if (error.response?.data?.data?.otpCode) {
                console.log("🎉 OTP found in error response:", error.response.data.data.otpCode);
                setMessage("Mã OTP đã được gửi về email của bạn!");
                setIsSuccess(true);
            }
            else if (error.response?.status === 200 || error.response?.data?.statusCode === 200) {
                console.log("🎉 Status 200 found in error response");
                setMessage("Mã OTP đã được gửi về email của bạn!");
                setIsSuccess(true);
            }


            else {
                console.log("💥 Real error occurred");
                if (error.response?.data?.message) {
                    setMessage(error.response.data.message);
                } else if (error.message) {
                    setMessage(error.message);
                } else {
                    setMessage("Email không tồn tại hoặc có lỗi xảy ra!");
                }
                setIsSuccess(false);
            }
        } finally {
            setIsLoading(false);
        }
    };




    const handleBackToLogin = () => {
        navigate("/login");
    };

    return (
        <div className="bg-blue-200 flex justify-center items-center min-h-screen p-5">
            <div className="rounded flex shadow-xl overflow-hidden w-full max-w-3xl border border-gray-300">
                {/* Left side - Form */}
                <div className="w-2/3 p-5 bg-gray-50 justify-center flex flex-col">
                    <h1 className="text-2xl flex justify-center font-semibold mb-2">
                        Quên mật khẩu
                    </h1>
                    <p className="text-gray-600 text-center mb-6 text-sm">
                        Nhập email của bạn để nhận mã OTP khôi phục mật khẩu
                    </p>

                    {!isSuccess ? (
                        <form onSubmit={handleForgotPassword}>
                            <MyInput
                                label="Địa chỉ email"
                                placeholder="Nhập địa chỉ email của bạn"
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            {message && !isSuccess && (
                                <p className="mb-4 text-center text-red-500 text-sm">
                                    {message}
                                </p>
                            )}

                            <div className="mb-6">
                                <MyButton title="Gửi mã OTP" type="submit" isLoading={isLoading} />
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleBackToLogin}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    ← Quay lại đăng nhập
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-green-600 mb-2">
                                    Email đã được gửi!
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Chúng tôi đã gửi mã OTP đến địa chỉ email <strong>{email}</strong>.
                                    Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn.
                                </p>
                                {message && (
                                    <p className="mb-4 text-center text-green-500 text-sm">
                                        {message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <MyButton
                                    title="Tiếp tục với OTP"
                                    onClick={() => navigate("/verify-otp", { state: { email } })}
                                />
                                <button
                                    onClick={handleBackToLogin}
                                    className="w-full text-blue-600 hover:underline text-sm"
                                >
                                    Quay lại đăng nhập
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side - Info */}
                <div className="w-1/2 bg-blue-900 p-4 rounded h-150 justify-center flex flex-col text-white">
                    <img
                        src="https://www.tlu.edu.vn/Portals/0/2014/Logo-WRU.png"
                        className="rounded-full object-cover mx-auto mb-4 w-20 h-20"
                        alt="Logo TLU"
                    />
                    <h2 className="text-xl font-bold mb-2 text-center">
                        Khôi phục mật khẩu
                    </h2>
                    <p className="text-gray-200 text-center text-sm leading-relaxed">
                        Đừng lo lắng! Chúng tôi sẽ gửi mã OTP đến email của bạn để bạn có thể
                        tạo mật khẩu mới và truy cập lại hệ thống.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
