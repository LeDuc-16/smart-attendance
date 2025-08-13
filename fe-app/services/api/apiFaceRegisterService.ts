// Face Registration API Service
export interface FaceRegistrationRequest {
  descriptor: string;
}

export interface FaceRegistrationResponse {
  id: number;
  userId: number;
  userName: string;
  message?: string;
}

export interface CheckRegistrationResponse {
  hasRegistered: boolean;
  userId: number;
  userName: string;
}

export interface AttendanceRequest {
  descriptor: string;
  threshold?: number;
}

export interface AttendanceResponse {
  userId: number;
  userName: string;
  timestamp: string;
  message: string;
}

class ApiFaceRegisterService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL?: string) {
    if (process.env.NODE_ENV === 'production') {
      this.baseURL = baseURL || process.env.REACT_APP_API_BASE_URL || 'http://14.225.210.41:8080';
    } else {
      this.baseURL = baseURL || 'http://localhost:8080';
    }
  }

  // Set token từ auth service
  setAuthToken(token: string) {
    this.authToken = token;
  }

  // Get headers
  private getHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Kiểm tra đã đăng ký face chưa
  async checkFaceRegistration(): Promise<CheckRegistrationResponse> {
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

  // Đăng ký nhiều face descriptors (cho multiple poses)
  async registerMultipleFaces(descriptors: string[]): Promise<FaceRegistrationResponse[]> {
    const results: FaceRegistrationResponse[] = [];
    
    for (const descriptor of descriptors) {
      const result = await this.registerFace({ descriptor });
      results.push(result);
    }
    
    return results;
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
  async markAttendance(descriptor: string, threshold: number = 0.6): Promise<AttendanceResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/face-recognition/attendance`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        descriptor,
        threshold
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Attendance marking failed');
    }

    return await response.json();
  }

  // Lấy lịch sử điểm danh
  async getAttendanceHistory(startDate?: string, endDate?: string): Promise<AttendanceResponse[]> {
    let endpoint = `${this.baseURL}/api/v1/face-recognition/attendance/history`;
    
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      endpoint += `?${params.toString()}`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Get attendance history failed');
    }

    return await response.json();
  }

  // Xóa face registration
  async deleteFaceRegistration(): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/v1/face-recognition/delete`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Delete face registration failed');
    }
  }

  // Update face descriptor
  async updateFaceRegistration(request: FaceRegistrationRequest): Promise<FaceRegistrationResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/face-recognition/update`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Update face registration failed');
    }

    return await response.json();
  }
}

// Export singleton instance
export const apiFaceRegisterService = new ApiFaceRegisterService();
export default ApiFaceRegisterService;
