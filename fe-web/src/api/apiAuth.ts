import axios, { AxiosError, type AxiosResponse } from 'axios';

interface AuthTokens {
    access_token: string;
    refresh_token: string;
}

interface ApiResponse<T> {
    statusCode: number;
    message: string;
    path: string;
    data: T;
}

interface ForgotPasswordResponse {
    statusCode: number;
    message: string;
    path: string;
    data: {
        otpCode?: string;
    };
}



interface ResetPasswordResponse {
    statusCode: number;
    message: string;
    path: string;
    data: any;
}

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const login = async (
    account: string,
    password: string
): Promise<any> => {
    try {
        const response = await api.post('/api/v1/auth/login', {
            account,
            password,
        });

        console.log("Login response:", response);

        const tokens: AuthTokens = response.data.data;
        localStorage.setItem('token', tokens.access_token); // Store the access token
        console.log("Token stored:", tokens.access_token); // Log the token
        return tokens;
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(axiosError.response?.data?.message || 'Đăng nhập thất bại');
    }
};

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
    try {
        const response: AxiosResponse<ForgotPasswordResponse> = await api.post('/api/v1/otp/forgot-password', {
            email,
        }, {
            validateStatus: function (status) {
                return true;
            }
        });

        console.log("Forgot password response:", response);

        if (response.data?.data?.otpCode || response.data?.statusCode === 200 || response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data?.message || 'Không thể gửi email khôi phục mật khẩu');
        }

    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse<any>>;
        console.error("Forgot password error:", axiosError);

        if (axiosError.response?.data?.data?.otpCode) {
            console.log("Found OTP in error response:", axiosError.response.data.data.otpCode);
            return axiosError.response.data;
        }

        if (axiosError.response?.data?.message) {
            throw new Error(axiosError.response.data.message);
        } else {
            throw new Error('Không thể gửi email khôi phục mật khẩu');
        }
    }
};

export const verifyOTP = async (email: string, otpCode: string): Promise<any> => {
    try {
        console.log("🔍 API verifyOTP request:", { email, otpCode });

        const response: AxiosResponse<any> = await api.post('/api/v1/otp/verify', {
            email: email.trim(),
            otpCode: otpCode.toString(),
        }, {
            validateStatus: function (status) {
                return true;
            },
            timeout: 15000,
        });

        console.log("API verifyOTP response:", response.data);
        console.log("API response status:", response.status);

        return {
            ...response.data,
            httpStatus: response.status
        };

    } catch (error) {
        const axiosError = error as AxiosError<any>;
        console.error("API verifyOTP error:", axiosError);

        if (axiosError.response?.data) {
            return {
                ...axiosError.response.data,
                httpStatus: axiosError.response.status
            };
        }

        throw axiosError;
    }
};





export const resetPassword = async (
    email: string,
    otpCode: string,
    newPassword: string
): Promise<ResetPasswordResponse & { status?: number }> => {
    try {
        console.log("🔍 API resetPassword request:", { email, otpCode, newPassword: "***" });

        const response: AxiosResponse<ResetPasswordResponse> = await api.post('/api/v1/otp/reset-password', {
            email: email.trim(),
            otpCode: otpCode.toString(),
            newPassword: newPassword.trim(),
            confirmPassword: newPassword.trim()
        }, {
            validateStatus: function (status) {
                return true;
            },
            timeout: 15000
        });

        console.log("API resetPassword response:", response.data);
        console.log("HTTP status:", response.status);


        return {
            ...response.data,
            status: response.status
        };

    } catch (error) {
        const axiosError = error as AxiosError<ResetPasswordResponse>;
        console.error("API resetPassword error:", axiosError);

        if (axiosError.response?.data) {
            return {
                ...axiosError.response.data,
                status: axiosError.response.status
            };
        }

        throw new Error('Không thể đặt lại mật khẩu');
    }
};


export default api;
