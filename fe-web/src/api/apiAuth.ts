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
): Promise<AuthTokens> => {
  try {
    const response: AxiosResponse<ApiResponse<AuthTokens>> = await api.post('/api/v1/auth/login', {
      account,
      password,
    });

    console.log("Login response:", response);

    const accessToken = response.data.data.access_token;

    if (accessToken) {
      localStorage.setItem("token", accessToken);
    } else {
      console.warn("Không có access_token trả về từ server");
    }

    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || 'Đăng nhập thất bại');
  }
};


export default api;
