// API Services Index - Export tất cả services

export { apiAuthService } from './apiAuthService';
export { apiFaceRegisterService } from './apiFaceRegisterService';

// Export types
export type {
  AuthResponse,
  LoginRequest,
  BackendApiResponse
} from './apiAuthService';

export type {
  FaceRegistrationRequest,
  FaceRegistrationResponse,
  CheckRegistrationResponse,
  AttendanceRequest,
  AttendanceResponse
} from './apiFaceRegisterService';
