// services/api/apiSchedule.ts

export interface Schedule {
  id: number;
  /** Original schedule id from backend (when id is synthesized for per-studyDay entries) */
  sourceId?: number;
  subjectName: string;
  subjectCode: string;
  classroomName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number; // 1-7 (Monday-Sunday)
  lecturerName?: string;
  topic?: string;
  date: string;
  isOpen?: boolean;
}

export interface ScheduleResponse {
  schedules: Schedule[];
  totalSchedules: number;
  isOpen: boolean;
}

export interface BackendApiResponse<T> {
  statusCode: number;
  message: string;
  path: string;
  data: T;
}

class ApiScheduleService {
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

  /**
   * Lecturer: open attendance for a schedule.
   * POST /api/v1/schedules/{id}/open
   */
  async openAttendance(scheduleId: number): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/v1/schedules/${scheduleId}/open`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: '',
    });

    const text = await response.text();
    if (!response.ok) {
      try {
        const err = JSON.parse(text);
        throw new Error(err.message || `Mở điểm danh thất bại (${response.status})`);
      } catch (_) {
        throw new Error(text || `Mở điểm danh thất bại (${response.status})`);
      }
    }

    try {
      const result = JSON.parse(text);
      return result;
    } catch (_) {
      return { message: text };
    }
  }

  /**
   * Lecturer: close attendance for a schedule.
   * POST /api/v1/schedules/{id}/close
   */
  async closeAttendance(scheduleId: number): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/v1/schedules/${scheduleId}/close`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: '',
    });

    const text = await response.text();
    if (!response.ok) {
      try {
        const err = JSON.parse(text);
        throw new Error(err.message || `Đóng điểm danh thất bại (${response.status})`);
      } catch (_) {
        throw new Error(text || `Đóng điểm danh thất bại (${response.status})`);
      }
    }

    try {
      const result = JSON.parse(text);
      return result;
    } catch (_) {
      return { message: text };
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (includeAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async getMySchedule(): Promise<ScheduleResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/schedules/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const error = JSON.parse(text);
        // Throw the actual error message from backend (e.g., "Không tìm thấy lớp cho sinh viên: 3")
        throw new Error(error.message || 'Lấy lịch học thất bại');
      } catch (parseError) {
        // If it's already the error we threw, re-throw it
        if (parseError instanceof Error && parseError.message !== text) {
          throw parseError;
        }
        throw new Error(text || 'Lấy lịch học thất bại');
      }
    }

    // Read raw text first to avoid JSON parse errors on empty responses
    const raw = await response.text();
    // console.log('Raw response from server:', raw); // Log the raw response
    if (!raw || raw.trim().length === 0) {
      // No body returned
      const msg = `Lấy lịch học thất bại: server trả về dữ liệu rỗng (${response.status})`;
      throw new Error(msg);
    }

    let resultJson: any;
    try {
      resultJson = JSON.parse(raw);
    } catch (e: any) {
      throw new Error(`Không thể phân tích JSON từ server: ${e?.message || String(e)}`);
    }
    // The backend may return different shapes:
    // 1) { statusCode, message, path, data: { schedules: [...] } }
    // 2) { statusCode, message, path, data: [ { CreateScheduleResponse }, ... ] }
    // Normalize both into ScheduleResponse { schedules: Schedule[] }

    const result: any = resultJson;
    if (!result || !result.data) {
      const msg =
        result?.message ||
        `Lấy lịch học thất bại: dữ liệu không hợp lệ từ server (status ${response.status})`;
      throw new Error(msg);
    }

    const normalizeTime = (t: string | undefined) => {
      if (!t) return '';
      // "HH:mm:ss" -> "HH:mm"
      const parts = t.split(':');
      return parts.length >= 2 ? `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}` : t;
    };

    const dayOfWeekFromString = (s: any) => {
      if (!s) return 0;
      if (typeof s === 'number') return s; // already numeric (1-7)
      const map: Record<string, number> = {
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
        SUNDAY: 7,
      };
      return map[String(s).toUpperCase()] || 0;
    };

    // Helper to map CreateScheduleResponse -> Schedule
    const mapCreateToSchedule = (item: any) => {
      // Try to extract a concrete date and dayOfWeek from weeks.studyDays if present
      let date = '';
      let dayOfWeek = 0;
      try {
        if (Array.isArray(item.weeks) && item.weeks.length > 0) {
          // find first studyDay with a date
          for (const w of item.weeks) {
            if (Array.isArray(w.studyDays) && w.studyDays.length > 0) {
              const sd = w.studyDays[0];
              if (sd) {
                if (sd.date) date = String(sd.date);
                if (sd.dayOfWeek) dayOfWeek = dayOfWeekFromString(sd.dayOfWeek);
                if (date || dayOfWeek) break;
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }

      return {
        id: item.id,
        sourceId: Number(item.id) || undefined,
        subjectName: item.courseName || item.subjectName || '',
        subjectCode: item.subjectCode || '',
        classroomName: item.roomName || item.classroomName || item.className || '',
        startTime: normalizeTime(item.startTime),
        endTime: normalizeTime(item.endTime),
        dayOfWeek: dayOfWeek,
        lecturerName: item.lecturerName || item.lecturer || '',
        topic: item.topic || '',
        date: date,
        isOpen:
          item.open === true ||
          item.isOpen === true ||
          item.opened === true ||
          item.is_open === true,
      } as Schedule;
    };

    // If data already follows { schedules: [...] }
    if (
      result.data &&
      typeof result.data === 'object' &&
      Array.isArray((result.data as any).schedules)
    ) {
      // Normalize schedules returned from backend so each item always contains an `isOpen` boolean
      const rawSchedules = (result.data as any).schedules as any[];
      const normalized = rawSchedules.map(
        (it) =>
          ({
            id: it.id,
            sourceId: Number(it.id) || undefined,
            subjectName: it.subjectName || it.courseName || '',
            subjectCode: it.subjectCode || '',
            classroomName: it.classroomName || it.roomName || it.className || '',
            startTime: typeof it.startTime === 'string' ? normalizeTime(it.startTime) : '',
            endTime: typeof it.endTime === 'string' ? normalizeTime(it.endTime) : '',
            dayOfWeek: typeof it.dayOfWeek === 'number' ? it.dayOfWeek : 0,
            lecturerName: it.lecturerName || it.lecturer || '',
            topic: it.topic || '',
            date: it.date || '',
            // unify possible flags
            isOpen:
              it.open === true || it.isOpen === true || it.opened === true || it.is_open === true,
          }) as Schedule
      );

      return { schedules: normalized, totalSchedules: normalized.length } as ScheduleResponse;
    }

    // If data is an array of schedules (CreateScheduleResponse[]), expand weeks.studyDays into individual Schedule entries
    if (Array.isArray(result.data)) {
      const out: Schedule[] = [];
      let globalCounter = 1;
      for (const item of result.data as any[]) {
        // If weeks exist, create an entry for each studyDay
        if (Array.isArray(item.weeks)) {
          for (const w of item.weeks) {
            if (Array.isArray(w.studyDays)) {
              for (const sd of w.studyDays) {
                const date = sd?.date ? String(sd.date) : '';
                const dow = dayOfWeekFromString(sd?.dayOfWeek);
                const scheduleEntry: Schedule = {
                  // generate a unique client-side id per studyDay but keep original id in sourceId
                  id: (Number(item.id) || 0) * 1000 + globalCounter++,
                  sourceId: Number(item.id) || undefined,
                  subjectName: item.courseName || item.subjectName || '',
                  subjectCode: item.subjectCode || '',
                  classroomName: item.className || item.classroomName || item.roomName || '',
                  startTime: normalizeTime(item.startTime),
                  endTime: normalizeTime(item.endTime),
                  dayOfWeek: dow,
                  lecturerName: item.lecturerName || item.lecturer || '',
                  topic: item.topic || '',
                  date: date,
                  // prefer studyDay-level open flag when present
                  isOpen:
                    sd?.open === true ||
                    sd?.isOpen === true ||
                    sd?.opened === true ||
                    sd?.is_open === true ||
                    item.open === true ||
                    item.isOpen === true ||
                    item.opened === true ||
                    item.is_open === true,
                };
                console.log('apiSchedule mapping studyDay:', {
                  scheduleId: item.id,
                  date: date,
                  'sd.open': sd?.open,
                  'item.open': item.open,
                  'final isOpen': scheduleEntry.isOpen,
                });
                out.push(scheduleEntry);
              }
            }
          }
        } else {
          // Fallback: map the item as a single schedule
          out.push(mapCreateToSchedule(item));
        }
      }

      return { schedules: out, totalSchedules: out.length } as ScheduleResponse;
    }

    // Unknown shape: throw using server message when available
    const msg = result?.message || 'Lấy lịch học thất bại: dữ liệu không hợp lệ từ server';
    throw new Error(msg);
  }

  async getTodaySchedules(): Promise<Schedule[]> {
    try {
      const scheduleData = await this.getMySchedule();
      const today = new Date();
      const todayDateString = today.toISOString().split('T')[0];
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1)); // Thứ Hai của tuần
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Chủ nhật của tuần
      const startOfWeekString = startOfWeek.toISOString().split('T')[0];
      const endOfWeekString = endOfWeek.toISOString().split('T')[0];

      return scheduleData.schedules.filter((schedule) => {
        // Lọc lịch trong tuần hiện tại
        if (schedule.date) {
          return schedule.date >= startOfWeekString && schedule.date <= endOfWeekString;
        }
        // Nếu không có ngày cụ thể, kiểm tra dayOfWeek
        const todayDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
        return schedule.dayOfWeek === todayDayOfWeek;
      });
    } catch (error: any) {
      console.error('Error getting today schedules:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  // Get upcoming schedules (next few hours)
  async getUpcomingSchedules(): Promise<Schedule[]> {
    try {
      const scheduleData = await this.getMySchedule();
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Giờ hiện tại tính bằng phút
      const todayDateString = now.toISOString().split('T')[0];

      return scheduleData.schedules
        .filter((schedule) => {
          const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
          const scheduleStartTime = startHour * 60 + startMinute;

          // Lấy lịch của ngày hiện tại hoặc các ngày sau trong tuần
          if (schedule.date >= todayDateString) {
            // Lịch trong tương lai hoặc hôm nay, ưu tiên lịch chưa bắt đầu
            return scheduleStartTime >= currentTime - 30;
          }
          return false;
        })
        .sort((a, b) => {
          // Sắp xếp theo ngày và giờ
          const aDateTime = new Date(`${a.date}T${a.startTime}`);
          const bDateTime = new Date(`${b.date}T${b.startTime}`);
          return aDateTime.getTime() - bDateTime.getTime();
        });
    } catch (error: any) {
      console.error('Error getting upcoming schedules:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}

export const apiScheduleService = new ApiScheduleService();
export default ApiScheduleService;

// Removed stray markdown code fences
