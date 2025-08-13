// API Service cho authentication và face recognition
export interface AuthResponse {
  access_token: string;  // Sửa để khớp với backend
  refresh_token: string;
}

export interface LoginRequest {
  account: string; // hoặc email
  password: string;
}

export interface BackendApiResponse<T> {
  statusCode: number;
  message: string;
  path: string;
  data: T;
}

export interface FaceRegistrationRequest {
  descriptor: string;
}

export interface FaceRegistrationResponse {
  id: number;
  userId: number;
  userName: string;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

class ApiService {
  private baseURL: string;
  private authToken: string | null = null;

   constructor(baseURL?: string) {
  if (process.env.NODE_ENV === 'production') {
    this.baseURL = baseURL || process.env.REACT_APP_API_BASE_URL || 'http://14.225.210.41:8080';
  } else {
    this.baseURL = baseURL || 'http://localhost:8080';
  }
}


  // Set token sau khi login thành công
  setAuthToken(token: string) {
    this.authToken = token;
  }

  // Get headers với authentication
  private getHeaders(includeAuth: boolean = true) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Login API
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('Attempting login with:', { account: credentials.account }); // Debug log
    
    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Login failed with status:', response.status, error); // Debug log
      throw new Error(error || 'Login failed');
    }

    const result: BackendApiResponse<AuthResponse> = await response.json();
    console.log('Login response:', result); // Debug log
    
    // Backend trả về: { statusCode, message, path, data: { access_token, refresh_token } }
    if (result.data && result.data.access_token) {
      this.setAuthToken(result.data.access_token);
      return result.data;
    }
    
    console.error('Invalid response structure:', result); // Debug log
    throw new Error('Invalid response format');
  }

  // Kiểm tra đã đăng ký face chưa
  async checkFaceRegistration(): Promise<{ hasRegistered: boolean; userId: number; userName: string }> {
    const response = await fetch(`${this.baseURL}/api/v1/face-recognition/check-registration`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Check registration failed');
    }

    return await response.json();
  }

  // Đăng ký face descriptor
  async registerFace(request: FaceRegistrationRequest): Promise<FaceRegistrationResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/face-recognition/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Face registration failed');
    }

    return await response.json();
  }

  // Lấy tất cả descriptors để điểm danh
  async getAllDescriptors(): Promise<FaceRegistrationResponse[]> {
    const response = await fetch(`${this.baseURL}/api/v1/face-recognition/all-descriptors`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Get descriptors failed');
    }

    return await response.json();
  }

  // Điểm danh bằng face
  async markAttendance(descriptor: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/v1/face-recognition/attendance`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        descriptor,
        threshold: 0.6
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Attendance marking failed');
    }

    return await response.json();
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default ApiService;
