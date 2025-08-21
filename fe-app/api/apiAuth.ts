// Authentication API Service
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  account: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  otp: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface BackendApiResponse<T> {
  statusCode: number;
  message: string;
  path: string;
  data: T;
}

class ApiAuthService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL?: string) {
    if (process.env.NODE_ENV === 'production') {
      this.baseURL = baseURL || process.env.REACT_APP_API_BASE_URL || 'http://14.225.210.41:8080';
    } else {
      this.baseURL = baseURL || 'http://localhost:8080';
    }
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private getHeaders(includeAuth: boolean = true) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      // Chỉ lấy message từ error response
      throw new Error(error.message || 'Đăng nhập thất bại');
    }

    const result: BackendApiResponse<AuthResponse> = await response.json();

    if (result.data && result.data.access_token) {
      this.setAuthToken(result.data.access_token);
      return result.data;
    }

    throw new Error('Invalid response format');
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseURL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch (error) {
      // Silent catch
    } finally {
      this.clearAuthToken();
    }
  }

  async verifyToken(): Promise<boolean> {
    if (!this.authToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/v1/auth/verify`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/v1/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Get current user failed');
    }

    return await response.json();
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/v1/otp/forgot-password`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gửi email thất bại');
    }

    const result: BackendApiResponse<any> = await response.json();
    return result;
  }

  async verifyOtp(request: VerifyOtpRequest): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/v1/otp/verify`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Xác thực OTP thất bại');
    }

    const result: BackendApiResponse<any> = await response.json();
    return result;
  }

  async resetPassword(request: ResetPasswordRequest): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đặt lại mật khẩu thất bại');
    }

    const result: BackendApiResponse<any> = await response.json();
    return result;
  }
}

export const apiAuthService = new ApiAuthService();
export default ApiAuthService;
