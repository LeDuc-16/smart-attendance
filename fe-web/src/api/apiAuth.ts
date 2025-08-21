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

interface VerifyOTPResponse {
    statusCode: number;
    message: string;
    path: string;
    data: {
        otpCode: string;
    };
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

        return response.data.data;
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
            console.log("🎉 Found OTP in error response:", axiosError.response.data.data.otpCode);
            return axiosError.response.data;
        }

        if (axiosError.response?.data?.message) {
            throw new Error(axiosError.response.data.message);
        } else {
            throw new Error('Không thể gửi email khôi phục mật khẩu');
        }
    }
};



export const verifyOTP = async (email: string, otpCode: string): Promise<VerifyOTPResponse> => {
    try {
        const response: AxiosResponse<VerifyOTPResponse> = await api.post('/api/v1/otp/verify', {
            email,
            otpCode,
        });

        console.log("Verify OTP response:", response);

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiResponse<any>>;
        console.error("Verify OTP error:", axiosError);

        if (axiosError.response?.data?.message) {
            throw new Error(axiosError.response.data.message);
        } else {
            throw new Error('Mã OTP không chính xác hoặc đã hết hạn');
        }
    }
};

export default api;
