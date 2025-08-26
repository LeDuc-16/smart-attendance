export interface FaceRegisterResponse {
  studentId: number;
  studentName: string;
  studentCode: string;
  studentClass: string;
  faceIds: string[];
  profileImageIds: string[];
  registeredAt: string;
  isRegistered: boolean; // Required field, defaults to false in backend
}

export interface FaceCompareResponse {
  studentId: number;
  studentName: string;
  similarity: number;
  faceId: string;
}

export interface LivenessSessionResponse {
  sessionId: string;
  clientRequestToken: string; // mới
}

export interface BackendApiResponse<T> {
  statusCode: number;
  message: string;
  path: string;
  data: T;
}

class ApiFaceService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL?: string) {
    const envBaseURL =
      process.env.REACT_NATIVE_APP_API_BASE_URL || process.env.REACT_APP_API_BASE_URL;

    if (process.env.NODE_ENV === 'production') {
      this.baseURL = baseURL || envBaseURL || 'http://14.225.210.41:8080';
    } else {
      const Constants = require('expo-constants').default;
      const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri || '';
      const lanHost = hostUri ? hostUri.split(':')[0] : '192.168.11.105';

      const LAN_BASE_URL = `http://${lanHost}:8080`;
      const ANDROID_LOCALHOST = 'http://10.0.2.2:8080';
      const IOS_LOCALHOST = 'http://localhost:8080';

      // Dùng Platform để phân biệt emulator vs device thật
      const Platform = require('react-native').Platform;

      if (Platform.OS === 'android' && !hostUri) {
        this.baseURL = ANDROID_LOCALHOST; // Android emulator
      } else if (Platform.OS === 'ios' && !hostUri) {
        this.baseURL = IOS_LOCALHOST; // iOS simulator
      } else {
        this.baseURL = baseURL || envBaseURL || LAN_BASE_URL;
      }
    }
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  private getHeaders(includeAuth: boolean = true) {
    const headers: HeadersInit = {};
    headers['Accept'] = 'application/json';
    if (includeAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  async registerFace(images: {
    top: { uri: string; type?: string; name?: string };
    bottom: { uri: string; type?: string; name?: string };
    left: { uri: string; type?: string; name?: string };
    right: { uri: string; type?: string; name?: string };
    center: { uri: string; type?: string; name?: string };
  }): Promise<FaceRegisterResponse> {
    const formData = new FormData();
    Object.entries(images).forEach(([key, value]) => {
      formData.append(key, {
        uri: value.uri,
        name: value.name || `${key}.jpg`,
        type: value.type || 'image/jpeg',
      } as any);
    });

    const response = await fetch(`${this.baseURL}/api/v1/student-faces/face-registration`, {
      method: 'POST',
      headers: this.getHeaders(), // do NOT set Content-Type for FormData
      body: formData,
    });

    const text = await response.text();
    if (!response.ok) {
      try {
        const error = JSON.parse(text);
        throw new Error(error.message || `Đăng ký khuôn mặt thất bại (${response.status})`);
      } catch (_) {
        throw new Error(text || `Đăng ký khuôn mặt thất bại (${response.status})`);
      }
    }

    const result: BackendApiResponse<FaceRegisterResponse> = JSON.parse(text);
    return result.data;
  }

  async createLivenessSession(): Promise<LivenessSessionResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/student-faces/liveness-session`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const error = JSON.parse(text);
        throw new Error(error.message || 'Tạo phiên liveness thất bại');
      } catch (_) {
        throw new Error(text || 'Tạo phiên liveness thất bại');
      }
    }

    const result: BackendApiResponse<LivenessSessionResponse> = await response.json();
    return result.data;
  }

  async compareFace(image: {
    uri: string;
    type?: string;
    name?: string;
  }): Promise<FaceCompareResponse> {
    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      name: image.name || 'face.jpg',
      type: image.type || 'image/jpeg',
    } as any);

    const response = await fetch(`${this.baseURL}/api/v1/student-faces/compare`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });
    const text = await response.text();
    if (!response.ok) {
      try {
        const error = JSON.parse(text);
        throw new Error(error.message || `So sánh khuôn mặt thất bại (${response.status})`);
      } catch (_) {
        throw new Error(text || `So sánh khuôn mặt thất bại (${response.status})`);
      }
    }

    const result: BackendApiResponse<FaceCompareResponse> = JSON.parse(text);
    return result.data;
  }

  async markAttendance(scheduleId: number, image: {
    uri: string;
    type?: string;
    name?: string;
  }): Promise<FaceCompareResponse> {
    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      name: image.name || 'attendance.jpg',
      type: image.type || 'image/jpeg',
    } as any);
    formData.append('scheduleId', scheduleId.toString());

    const response = await fetch(`${this.baseURL}/api/v1/student-faces/attendance`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });
    const text = await response.text();
    if (!response.ok) {
      try {
        const error = JSON.parse(text);
        throw new Error(error.message || `Điểm danh thất bại (${response.status})`);
      } catch (_) {
        throw new Error(text || `Điểm danh thất bại (${response.status})`);
      }
    }

    const result: BackendApiResponse<FaceCompareResponse> = JSON.parse(text);
    return result.data;
  }

  async checkAttendanceStatus(scheduleId: number): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/v1/schedules/${scheduleId}/status`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      // If endpoint doesn't exist, continue with attendance attempt
      return { isOpen: true }; // Assume open for compatibility
    }

    const result = await response.json();
    return result.data || result;
  }
}

export const apiFaceService = new ApiFaceService();
export default ApiFaceService;
