// services/api/apiSchedule.ts

export interface Schedule {
  id: number;
  subjectName: string;
  subjectCode: string;
  classroomName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number; // 1-7 (Monday-Sunday)
  lecturerName?: string;
  topic?: string;
  date: string;
}

export interface ScheduleResponse {
  schedules: Schedule[];
  totalSchedules: number;
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
    if (process.env.NODE_ENV === 'production') {
      this.baseURL = baseURL || process.env.REACT_APP_API_BASE_URL || 'http://14.225.210.41:8080'; // server public
    } else {
      // trong dev thì lấy IP LAN thay vì localhost
      const LAN_IP = '172.20.10.2'; // mỗi lần Expo show, copy IP này
      this.baseURL = baseURL || `http://${LAN_IP}:8080`;
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
        subjectName: item.courseName || item.subjectName || '',
        subjectCode: item.subjectCode || '',
        classroomName: item.roomName || item.classroomName || item.className || '',
        startTime: normalizeTime(item.startTime),
        endTime: normalizeTime(item.endTime),
        dayOfWeek: dayOfWeek,
        lecturerName: item.lecturerName || item.lecturer || '',
        topic: item.topic || '',
        date: date,
      } as Schedule;
    };

    // If data already follows { schedules: [...] }
    if (
      result.data &&
      typeof result.data === 'object' &&
      Array.isArray((result.data as any).schedules)
    ) {
      return result.data as ScheduleResponse;
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
                  id: (Number(item.id) || 0) * 1000 + globalCounter++,
                  subjectName: item.courseName || item.subjectName || '',
                  subjectCode: item.subjectCode || '',
                  classroomName: item.roomName || item.classroomName || item.className || '',
                  startTime: normalizeTime(item.startTime),
                  endTime: normalizeTime(item.endTime),
                  dayOfWeek: dow,
                  lecturerName: item.lecturerName || item.lecturer || '',
                  topic: item.topic || '',
                  date: date,
                };
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
