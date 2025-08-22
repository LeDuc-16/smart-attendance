import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MyButton from "../components/MyButton";
import MyInput from "../components/MyInput";
import { changePassword } from "../api/apiUser";

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmationPassword, setConfirmationPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (!currentPassword || !newPassword || !confirmationPassword) {
            setMessage("Vui lòng nhập đầy đủ tất cả các trường!");
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setMessage("Mật khẩu mới phải có ít nhất 6 ký tự!");
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmationPassword) {
            setMessage("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            setIsLoading(false);
            return;
        }

        try {
            const response = await changePassword({
                currentPassword,
                newPassword,
                confirmationPassword
            });

            if (response && response.statusCode === 200) {
                setMessage("Đổi mật khẩu thành công!");
                setIsSuccess(true);

                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            } else {
                setMessage(response?.message || "Đổi mật khẩu thất bại!");
            }
        } catch (error: any) {
            if (error.response?.data?.message) {
                setMessage(error.response.data.message);
            } else if (error.message) {
                setMessage(error.message);
            } else {
                setMessage("Có lỗi xảy ra. Vui lòng thử lại!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-blue-200 flex justify-center items-center min-h-screen p-5">
            <div className="rounded flex shadow-xl overflow-hidden w-full max-w-3xl border border-gray-300">
                <div className="w-2/3 p-5 bg-gray-50 justify-center flex flex-col">
                    <h1 className="text-2xl flex justify-center font-semibold mb-4">
                        Thay đổi mật khẩu
                    </h1>

                    {!isSuccess ? (
                        <form onSubmit={handleChangePassword}>
                            <MyInput
                                label="Mật khẩu hiện tại"
                                placeholder="Nhập mật khẩu hiện tại"
                                type="password"
                                id="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />

                            <MyInput
                                label="Mật khẩu mới"
                                placeholder="Nhập mật khẩu mới"
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />

                            <MyInput
                                label="Xác nhận mật khẩu mới"
                                placeholder="Nhập lại mật khẩu mới"
                                type="password"
                                id="confirmationPassword"
                                value={confirmationPassword}
                                onChange={(e) => setConfirmationPassword(e.target.value)}
                            />

                            <MyButton
                                title="Đổi mật khẩu"
                                type="submit"
                                isLoading={isLoading}
                            />

                            {message && !isSuccess && (
                                <p className="mt-4 text-center text-red-500">
                                    {message}
                                </p>
                            )}

                            <div className="mt-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate("/dashboard")}
                                    className="text-sm text-gray-600 hover:underline"
                                >
                                    ← Quay lại trang chủ
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-green-600 mb-2">
                                Thành công!
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Mật khẩu của bạn đã được thay đổi thành công.
                            </p>
                            {message && (
                                <p className="mb-4 text-center text-green-500 text-sm">
                                    {message}
                                </p>
                            )}
                            <p className="text-gray-500 text-sm">
                                Đang chuyển về trang chủ...
                            </p>
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
                        Bảo mật tài khoản
                    </h2>
                    <p className="text-gray-200 text-center text-sm leading-relaxed">
                        Thay đổi mật khẩu định kỳ giúp bảo vệ tài khoản của bạn an toàn hơn.
                        Hãy sử dụng mật khẩu mạnh với ít nhất 6 ký tự, bao gồm chữ cái và số.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
