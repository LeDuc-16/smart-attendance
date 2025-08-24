
export interface FaceRegisterResponse {
  studentId: number;
  faceIds: string[];
  profileImageIds: string[];
  registeredAt: string;
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
    if (baseURL) {
      this.baseURL = baseURL;
      return;
    }

    const envBaseURL =
      process.env.REACT_NATIVE_APP_API_BASE_URL ||
      process.env.REACT_APP_API_BASE_URL;

    if (process.env.NODE_ENV === 'production') {
      this.baseURL = envBaseURL || 'http://14.225.210.41:8080';
    } else {
      // Development
      // LAN IP của máy dev (dùng cho thiết bị thật)
      const LAN_BASE_URL = 'http://192.168.11.105:8080';
      // Localhost cho simulator/emulator
      const LOCALHOST_BASE_URL = 'http://localhost:8080';
      this.baseURL = envBaseURL || LAN_BASE_URL || LOCALHOST_BASE_URL;
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
}

export const apiFaceService = new ApiFaceService();
export default ApiFaceService;
