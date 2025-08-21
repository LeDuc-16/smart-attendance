import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MyButton from "../components/MyButton";
import { verifyOTP, forgotPassword } from "../api/apiAuth";

const VerifyOTPPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    useEffect(() => {
        let timer: number;
        if (countdown > 0) {
            timer = window.setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        }
        return () => {
            window.clearTimeout(timer);
        };
    }, [countdown]);

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newOtp = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(newOtp);

        if (message && newOtp.length > 0) {
            setMessage(null);
            setIsError(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setIsError(false);

        if (!otp || otp.length !== 6) {
            setMessage("Vui lòng nhập mã OTP 6 số!");
            setIsError(true);
            setIsLoading(false);
            return;
        }

        try {
            console.log("Sending verify request:", { email, otpCode: otp });
            const response = await verifyOTP(email, otp);
            console.log("Verify response:", response);

            let isVerifySuccess = false;
            let successReason = "";

            if (response?.data?.otpCode || response?.otpCode) {
                isVerifySuccess = true;
                successReason = "Response contains otpCode";
            }

            if (response?.message && (
                response.message.includes("thành công") ||
                response.message.includes("successfully") ||
                response.message.includes("verified")
            )) {
                isVerifySuccess = true;
                successReason = "Success message detected";
            }

            if (response && !response.message?.includes("không hợp lệ") &&
                !response.message?.includes("hết hạn") &&
                !response.message?.includes("invalid")) {
                isVerifySuccess = true;
                successReason = "No error message detected";
            }

            console.log("Success analysis:", {
                isVerifySuccess,
                successReason,
                hasData: !!response?.data,
                message: response?.message,
                httpStatus: response?.httpStatus
            });

            if (isVerifySuccess) {
                console.log("Frontend: OTP verification successful -", successReason);

                setMessage("Xác thực thành công! Đang chuyển trang...");
                setIsError(false);
                setIsSuccess(true);

                const verifiedOtp = otp;
                setOtp("");

                setTimeout(() => {
                    console.log("🚀 Navigating to reset password with:", { email, otpCode: verifiedOtp });
                    navigate("/reset-password", {
                        state: {
                            email: email,
                            otpCode: verifiedOtp
                        },
                        replace: true
                    });
                }, 1200);


            } else {
                console.log("❌ Frontend: OTP verification failed");
                setMessage("Mã OTP không chính xác hoặc đã được sử dụng");
                setIsError(true);
                setOtp("");

                setTimeout(() => {
                    setMessage("Vui lòng bấm 'Gửi lại mã OTP' để nhận mã mới");
                    setIsError(false);
                }, 3000);
            }

        } catch (error: any) {
            console.error("Verify error:", error);
            setMessage("Có lỗi xảy ra. Vui lòng thử lại!");
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };


    const handleResendOTP = async () => {
        setIsResending(true);
        setMessage("Đang gửi mã OTP mới...");
        setIsError(false);
        setIsSuccess(false);
        setOtp("");

        try {
            await forgotPassword(email);
            setMessage("Mã OTP mới đã được gửi! Vui lòng kiểm tra email.");
            setIsError(false);
            setCountdown(60);
        } catch (error: any) {
            const hasSuccess = error.response?.status === 200 ||
                error.response?.data?.statusCode === 200 ||
                error.response?.data?.data?.otpCode;

            if (hasSuccess) {
                setMessage("Mã OTP mới đã được gửi! Vui lòng kiểm tra email.");
                setIsError(false);
                setCountdown(60);
            } else {
                setMessage("Không thể gửi lại OTP. Vui lòng thử lại!");
                setIsError(true);
            }
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="bg-blue-200 flex justify-center items-center min-h-screen p-5">
            <div className="rounded flex shadow-xl overflow-hidden w-full max-w-3xl border border-gray-300">
                <div className="w-2/3 p-5 bg-gray-50 justify-center flex flex-col">
                    <h1 className="text-2xl flex justify-center font-semibold mb-2">
                        Xác thực OTP
                    </h1>
                    <p className="text-gray-600 text-center mb-6 text-sm">
                        Nhập mã OTP đã được gửi đến <strong>{email}</strong>
                    </p>

                    {isSuccess ? (
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-green-600 font-medium text-lg mb-2">Xác thực thành công!</p>
                            <p className="text-gray-500 text-sm">Đang chuyển đến trang đặt lại mật khẩu...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleVerifyOTP}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Mã OTP <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    placeholder="Nhập mã OTP 6 số"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-base tracking-widest"
                                    maxLength={6}
                                    disabled={isLoading || isResending || isSuccess}
                                />
                            </div>

                            {message && (
                                <p className={`mb-4 text-center text-sm font-medium ${isError ? "text-red-500" : "text-green-500"
                                    }`}>
                                    {message}
                                </p>
                            )}

                            <div className="mb-6">
                                <MyButton
                                    title={isSuccess ? "Đang chuyển trang..." : "Xác thực"}
                                    type="submit"
                                    isLoading={isLoading}
                                    disabled={isResending || isSuccess}
                                />
                            </div>

                            <div className="text-center space-y-2">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={isResending || isLoading || countdown > 0 || isSuccess}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50 block"
                                >
                                    {countdown > 0 ? `Gửi lại sau ${countdown}s` :
                                        isResending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/forgot-password")}
                                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                                    disabled={isLoading || isResending || isSuccess}
                                >
                                    ← Quay lại nhập email khác
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="w-1/2 bg-blue-900 p-4 rounded h-150 justify-center flex flex-col text-white">
                    <img
                        src="https://www.tlu.edu.vn/Portals/0/2014/Logo-WRU.png"
                        className="rounded-full object-cover mx-auto mb-4"
                        alt="Logo TLU"
                    />
                    <h2 className="text-xl font-bold mb-2 text-center">
                        Xác thực OTP
                    </h2>
                    <p className="text-gray-200 text-center text-sm leading-relaxed">
                        Mã OTP có hiệu lực trong <strong>5 phút</strong>.
                        {isSuccess ?
                            " Xác thực thành công, đang chuyển trang..." :
                            " Nếu nhập sai hoặc hết hạn, vui lòng lấy mã mới."
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTPPage;
