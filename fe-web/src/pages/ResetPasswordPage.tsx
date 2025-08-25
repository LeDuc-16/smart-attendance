import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MyButton from "../components/MyButton";
import MyInput from "../components/MyInput";
import { resetPassword } from "../api/apiAuth";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";
    const otpCode = location.state?.otpCode || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        console.log("ResetPasswordPage state:", {
            email: `"${email}"`,
            otpCode: `"${otpCode}"`,
            emailExists: !!email,
            otpCodeExists: !!otpCode,
            locationState: location.state
        });

        if (!email || !otpCode) {
            console.warn("Missing email or otpCode, redirecting to forgot-password");
            navigate("/forgot-password", { replace: true });
        }
    }, [email, otpCode, navigate, location.state]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (!email || !otpCode) {
            setMessage("Thiếu thông tin xác thực. Vui lòng thử lại từ đầu.");
            setIsLoading(false);
            navigate("/forgot-password", { replace: true });
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            setMessage("Mật khẩu phải có ít nhất 6 ký tự!");
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("Mật khẩu xác nhận không khớp!");
            setIsLoading(false);
            return;
        }

        try {
            console.log("Reset password API call:", {
                email,
                otpCode,
                newPasswordLength: newPassword.length,
                confirmPasswordLength: confirmPassword.length
            });

            const response = await resetPassword(email, otpCode, newPassword);
            console.log("Reset password response:", response);

            if (response?.statusCode === 200 || response?.status === 200) {
                setMessage("Đặt lại mật khẩu thành công!");
                setIsSuccess(true);
            } else {
                setMessage(response?.message || "Có lỗi xảy ra. Vui lòng thử lại!");
            }

        } catch (error: any) {
            console.error("Reset password error:", error);

            if (error.response?.status === 200 || error.response?.data?.statusCode === 200) {
                setMessage("Đặt lại mật khẩu thành công!");
                setIsSuccess(true);
            } else {
                setMessage(error.response?.data?.message || error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-blue-200 flex justify-center items-center min-h-screen p-5">
            <div className="rounded flex shadow-xl overflow-hidden w-full max-w-3xl border border-gray-300">
                <div className="w-2/3 p-5 bg-gray-50 justify-center flex flex-col">
                    <h1 className="text-2xl flex justify-center font-semibold mb-2">
                        Đặt lại mật khẩu
                    </h1>
                    <p className="text-gray-600 text-center mb-6 text-sm">
                        Tạo mật khẩu mới cho tài khoản <strong>{email || "đang tải..."}</strong>
                    </p>

                    {(!email || !otpCode) && (
                        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-center">
                            <p className="text-yellow-700 text-sm">
                                Thiếu thông tin xác thực. Đang chuyển hướng...
                            </p>
                        </div>
                    )}

                    {!isSuccess ? (
                        <form onSubmit={handleResetPassword}>
                            <MyInput
                                label="Mật khẩu mới"
                                placeholder="Nhập mật khẩu mới"
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                disabled={!email || !otpCode}
                            />

                            <MyInput
                                label="Xác nhận mật khẩu"
                                placeholder="Nhập lại mật khẩu mới"
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                disabled={!email || !otpCode}
                            />

                            {message && !isSuccess && (
                                <p className="mb-4 text-center text-red-500 text-sm">
                                    {message}
                                </p>
                            )}

                            <div className="mb-6">
                                <MyButton
                                    title="Đặt lại mật khẩu"
                                    type="submit"
                                    isLoading={isLoading}
                                    disabled={!email || !otpCode}
                                />
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="text-sm text-gray-600 hover:underline"
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
                                    Thành công!
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Mật khẩu của bạn đã được đặt lại thành công.
                                    Bạn có thể đăng nhập bằng mật khẩu mới.
                                </p>
                                {message && (
                                    <p className="mb-4 text-center text-green-500 text-sm">
                                        {message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <MyButton
                                    title="Đăng nhập ngay"
                                    onClick={() => navigate("/login")}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-1/2 bg-blue-900 p-4 rounded h-150 justify-center flex flex-col text-white">
                    <img
                        src="https://www.tlu.edu.vn/Portals/0/2014/Logo-WRU.png"
                        className="rounded-full object-cover mx-auto mb-4"
                        alt="Logo TLU"
                    />
                    <h2 className="text-xl font-bold mb-2 text-center">
                        Hoàn tất
                    </h2>
                    <p className="text-gray-200 text-center text-sm leading-relaxed">
                        Tạo mật khẩu mạnh với ít nhất 6 ký tự, bao gồm chữ cái, số
                        để bảo mật tài khoản của bạn.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;