import { BackendApiResponse } from './apiAuth'; // Assuming BackendApiResponse is defined in apiAuth.ts

export interface Schedule {
  id: number;
  startTime: string;
  endTime: string;
  courseId: number;
  lecturerId: number;
  classId: number;
  roomId: number;
  weeks: Week[];
}

export interface Week {
  weekNumber: number;
  startDate: string;
  endDate: string;
  studyDays: StudyDay[];
}

export interface StudyDay {
  dayOfWeek: string;
  date: string;
}

export interface Course {
  id: number;
  courseName: string;
  credits: number;
}

export interface Class {
  id: number;
  className: string;
  capacityStudent: number;
  advisor: string | null;
}

export interface Room {
  id: number;
  roomCode: string;
  locations: string;
}

export interface Student {
  id: number;
  studentCode: string;
  studentName: string;
  className: string;
  majorName: string | null;
  facultyName: string | null;
  account: string;
  email: string;
  role: string | null;
}

class ApiScheduleService {
  private baseURL: string;
  private authToken: string | null = null; // Assuming token is managed elsewhere or passed

  constructor(baseURL?: string) {
    if (process.env.NODE_ENV === 'production') {
      this.baseURL =
        baseURL ||
        process.env.REACT_APP_API_BASE_URL ||
        'http://14.225.210.41:8080';
    } else {
      this.baseURL = baseURL || 'http://192.168.68.109:8080';
    }
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    // In a real app, you'd get this from secure storage (e.g., AsyncStorage)
    return this.authToken;
  }

  private getHeaders(includeAuth: boolean = true) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken(); // Get current token
    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async getSchedules(): Promise<Schedule[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/schedules`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch schedules');
      }

      const result: BackendApiResponse<Schedule[]> = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }

  async getCourses(): Promise<Course[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/courses`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch courses');
      }

      const result: BackendApiResponse<Course[]> = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  async getClasses(): Promise<Class[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/classes`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch classes');
      }

      const result: BackendApiResponse<Class[]> = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  }

    async getRooms(): Promise<Room[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/rooms`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch rooms');
      }

      const result: BackendApiResponse<Room[]> = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  }

  async getStudents(): Promise<Student[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/students`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch students');
      }

      const result: BackendApiResponse<Student[]> = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }
}

export const apiScheduleService = new ApiScheduleService();
export default ApiScheduleService;