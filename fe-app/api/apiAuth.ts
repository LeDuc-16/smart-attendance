// services/api/apiAuthService.ts
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user?: UserInfo; // Generic user info
}

export interface StudentResponse {
  id: number;
  studentCode: string;
  studentName: string;
  className: string;
  majorName: string;
  facultyName: string;
  account: string;
  email: string;
  role: 'STUDENT';
  isRegistered: boolean; // Required field, defaults to false in backend
  registered: boolean; // Backend actually returns this field name
}

export interface LecturerResponse {
  id: number;
  lecturerCode: string;
  name: string;
  email: string;
  account: string;
  role: 'LECTURER';
  academicRank?: string;
  facultyId?: number;
  userId: number;
  isRegistered: boolean; // Required field, defaults to false in backend
  registered: boolean; // Backend actually returns this field name
}

// Union type cho user info
export type UserInfo = StudentResponse | LecturerResponse;

export interface LoginRequest {
  account: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  otp: string;
  message: string;
}

export interface ResetPasswordRequest {
  otpCode: string; // Backend cần otpCode để tìm user
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyOtpRequest {
  otpCode: string; // Chỉ cần otpCode thôi
}

export interface VerifyOtpResponse {
  otp: string;
  message: string;
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
  private userInfo: UserInfo | null = null;

  constructor(baseURL?: string) {
    const envBaseURL =
      process.env.REACT_NATIVE_APP_API_BASE_URL || process.env.REACT_APP_API_BASE_URL;

    if (process.env.NODE_ENV === 'production') {
      this.baseURL = baseURL || envBaseURL || 'http://14.225.210.41:8080';
    } else {
      // Development
      const LAN_BASE_URL = 'http://192.168.1.3:8080'; // IP LAN của máy Vinh

      const LOCALHOST_BASE_URL = 'http://localhost:8080'; // Dùng cho emulator
      this.baseURL = baseURL || envBaseURL || LAN_BASE_URL || LOCALHOST_BASE_URL;

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

  setUserInfo(user: UserInfo) {
    this.userInfo = user;
  }

  getUserInfo(): UserInfo | null {
    return this.userInfo;
  }

  clearUserInfo() {
    this.userInfo = null;
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

  // ================== API Methods ==================
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng nhập thất bại');
    }

    const result: BackendApiResponse<AuthResponse> = await response.json();
    console.log('Login API response:', result);

    if (result.data && result.data.access_token) {
      this.setAuthToken(result.data.access_token);

      // Save user info nếu có
      if (result.data.user) {
        this.setUserInfo(result.data.user);
      }

      return result.data;
    }

    throw new Error('Invalid response format');
  }

  async forgotPassword(
    request: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    console.log(
      'Calling forgotPassword with email:',
      request.email,
      'at',
      new Date().toISOString()
    );
    const response = await fetch(`${this.baseURL}/api/v1/otp/forgot-password`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('ForgotPassword API error:', error);
      throw new Error(error.message || 'Gửi email OTP thất bại');
    }

    const result = await response.json();
    console.log('ForgotPassword API response:', result);

    // API trả về {"otpCode": "778599"}
    if (!result.otpCode) {
      throw new Error('Không nhận được OTP từ server');
    }

    return {
      otp: String(result.otpCode),
      message: result.message || 'OTP đã được gửi đến email của bạn',
    };
  }

  async verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    console.log('VerifyOtp request:', request);

    const requestBody = { otpCode: request.otpCode };

    const response = await fetch(`${this.baseURL}/api/v1/otp/verify`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(requestBody),
    });

    console.log('VerifyOtp response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('VerifyOtp API error:', error);
      throw new Error(error.message || 'Xác thực OTP thất bại');
    }

    const result = await response.json();
    console.log('VerifyOtp API response:', result);

    let responseOtp: string | null = null;
    if (result.otpCode) {
      responseOtp = result.otpCode;
    } else if (result.otp) {
      responseOtp = result.otp;
    } else if (result.data?.otp) {
      responseOtp = result.data.otp;
    }

    if (!responseOtp) {
      throw new Error('Không nhận được OTP xác thực từ server');
    }

    return {
      otp: String(responseOtp),
      message: result.message || 'Xác thực OTP thành công',
    };
  }

  async resetPassword(request: ResetPasswordRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/otp/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đặt lại mật khẩu thất bại');
    }

    const result = await response.json();
    console.log('ResetPassword API response:', result);

    if (result.access_token) {
      this.setAuthToken(result.access_token);
      return {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      };
    }

    if (result.accessToken) {
      this.setAuthToken(result.accessToken);
      return {
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      };
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
      this.clearUserInfo();
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
      throw new Error(error || 'Lấy thông tin người dùng thất bại');
    }

    return await response.json();
  }
}

export const apiAuthService = new ApiAuthService();
export default ApiAuthService;
