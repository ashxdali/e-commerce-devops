import apiClient from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const authService = {
  async register(dto: RegisterDto): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/v1/auth/register', dto);
    return response.data.data;
  },

  async login(dto: LoginDto): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/v1/auth/login', dto);
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/v1/auth/me');
    return response.data.data.user;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
    }
  },
};

export default authService;
