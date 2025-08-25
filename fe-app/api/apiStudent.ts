// fe-app/api/apiStudent.ts

import { apiAuthService } from './apiAuth'; // Assuming apiAuthService is used for token management

export interface Student {
  id: number;
  studentCode: string;
  studentName: string;
  className: string;
  majorName: string;
  facultyName: string;
  account: string;
  email: string;
  role: string | null;
  registered: boolean;
}

export interface StudentListResponse {
  statusCode: number;
  message: string;
  path: string;
  data: Student[];
}

class ApiStudentService {
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

      const Platform = require('react-native').Platform;

      if (Platform.OS === 'android' && !hostUri) {
        this.baseURL = ANDROID_LOCALHOST;
      } else if (Platform.OS === 'ios' && !hostUri) {
        this.baseURL = IOS_LOCALHOST;
      } else {
        this.baseURL = baseURL || envBaseURL || LAN_BASE_URL;
      }
    }
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders(includeAuth: boolean = true) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (includeAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async getStudentsByClass(className: string): Promise<Student[]> {
    const response = await fetch(`${this.baseURL}/api/v1/students/by-class/${className}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch students.';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: StudentListResponse = await response.json();
    if (result.statusCode === 200 && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to retrieve student data.');
    }
  }
}

export const apiStudentService = new ApiStudentService();
export default ApiStudentService;
