// Authentication API Service
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  account: string;
  password: string;
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

  // Set token sau khi login thành công
  setAuthToken(token: string) {
    this.authToken = token;
  }

  // Clear token khi logout
  clearAuthToken() {
    this.authToken = null;
  }

  // Get current token
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Get headers
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
    console.log('Attempting login with:', { account: credentials.account });
    
    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Login failed with status:', response.status, error);
      throw new Error(error || 'Login failed');
    }

    const result: BackendApiResponse<AuthResponse> = await response.json();
    console.log('Login response:', result);
    
    // Backend trả về: { statusCode, message, path, data: { access_token, refresh_token } }
    if (result.data && result.data.access_token) {
      this.setAuthToken(result.data.access_token);
      return result.data;
    }
    
    console.error('Invalid response structure:', result);
    throw new Error('Invalid response format');
  }

  // Logout API
  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseURL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthToken();
    }
  }

  // Verify token
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
      console.error('Token verification failed:', error);
      return false;
    }
  }

  // Get current user info
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
}

// Export singleton instance
export const apiAuthService = new ApiAuthService();
export default ApiAuthService;
