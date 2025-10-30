import axios from 'axios';

const API_BASE_URL = 'https://testhostharan.leapmile.com';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTc2OTU4MDgzMX0.WRkWCmuO634oFp6BslP5Zi9JmplLoBZWAibU4XQ48_w';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export interface User {
  record_id: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  user_type: 'Admin' | 'Read_only' | 'Read_write';
  user_role: 'Picking' | 'in-bound' | 'admin' | 'all-ops';
}

export interface CreateUserData {
  user_name: string;
  user_email: string;
  user_type: string;
  user_phone: string;
  password: string;
  user_role: string;
}

export const userApi = {
  // Get all users or filter by parameters
  getUsers: async (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/user/users${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  },

  // Get user by phone
  getUserByPhone: async (phone: string) => {
    const response = await api.get(`/user/users?user_phone=${phone}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: CreateUserData) => {
    // Convert all values to lowercase
    const lowercaseData = {
      user_name: userData.user_name.toLowerCase(),
      user_email: userData.user_email.toLowerCase(),
      user_type: userData.user_type.toLowerCase(),
      user_phone: userData.user_phone.toLowerCase(),
      password: userData.password.toLowerCase(),
      user_role: userData.user_role.toLowerCase(),
    };
    const params = new URLSearchParams(lowercaseData as any);
    const response = await api.post(`/user/user?${params.toString()}`);
    return response.data;
  },

  // Update user
  updateUser: async (phone: string, userData: Partial<CreateUserData>) => {
    const params = new URLSearchParams({ user_phone: phone, ...userData } as any);
    const response = await api.patch(`/user/user?${params.toString()}`);
    return response.data;
  },

  // Delete user
  deleteUser: async (phone: string) => {
    const response = await api.delete(`/user/user?user_phone=${phone}`);
    return response.data;
  },
};
