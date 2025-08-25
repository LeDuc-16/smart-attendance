import axios, { AxiosError, type AxiosResponse } from 'axios';

interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmationPassword: string;
}

interface ChangePasswordResponse {
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

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log("🔐 Token check:", {
        exists: !!token,
        preview: token ? token.substring(0, 20) + "..." : "NO TOKEN"
    });

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn("⚠️ No token found - user might not be logged in");
    }
    return config;
});

export const changePassword = async (request: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    try {
        console.log("=== FRONTEND CHANGE PASSWORD REQUEST ===");
        console.log("Request data:", {
            currentPassword: request.currentPassword ? "***" : "EMPTY",
            newPassword: request.newPassword ? "***" : "EMPTY",
            confirmationPassword: request.confirmationPassword ? "***" : "EMPTY",
            requestLength: JSON.stringify(request).length
        });

        // Check token
        const token = localStorage.getItem('token');
        console.log("Token exists:", !!token);
        if (token) {
            console.log("Token preview:", token.substring(0, 20) + "...");
        }

        const response: AxiosResponse<ChangePasswordResponse> = await api.patch('/api/v1/users/change-password', {
            currentPassword: request.currentPassword.trim(),
            newPassword: request.newPassword.trim(),
            confirmationPassword: request.confirmationPassword.trim()
        }, {
            validateStatus: function (status) {
                return true;
            },
            timeout: 15000
        });

        console.log("API response received:");
        console.log("Status:", response.status);
        console.log("Data:", response.data);
        console.log("Headers:", response.headers);

        return response.data;

    } catch (error) {
        const axiosError = error as AxiosError<ChangePasswordResponse>;
        console.error("API ERROR:");
        console.error("Error message:", axiosError.message);
        console.error("Response status:", axiosError.response?.status);
        console.error("Response data:", axiosError.response?.data);
        console.error("Response headers:", axiosError.response?.headers);

        if (axiosError.response?.data) {
            return axiosError.response.data;
        }

        throw new Error('Cannot change password');
    }
};


export default api;