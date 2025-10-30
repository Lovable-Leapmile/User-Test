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
  id: number;
  user_name: string;
  user_phone: string;
  user_email: string;
  user_type: string;
  user_role: string;
  status: string | null;
  created_at: string;
  updated_at: string;
  user_password: string;
  user_password_expiry: string | null;
  user_password_enabled: boolean;
  user_otp: string | null;
  user_otp_enabled: boolean;
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
  getUsers: async (filters?: Record<string, string>): Promise<User[]> => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/user/users${params.toString() ? `?${params.toString()}` : ''}`);

      // Extract users from records property
      const data = response.data;
      if (data && data.records && Array.isArray(data.records)) {
        return data.records;
      }
      return [];
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getUserByPhone: async (phone: string): Promise<User[]> => {
    const response = await api.get(`/user/users?user_phone=${phone}`);
    const data = response.data;

    if (data && data.records && Array.isArray(data.records)) {
      return data.records;
    }
    return [];
  },

  createUser: async (userData: CreateUserData) => {
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

  updateUser: async (phone: string, userData: Partial<CreateUserData>) => {
    // Filter out empty values and only include changed fields
    const updateData: Record<string, string> = {};

    if (userData.user_name && userData.user_name.trim() !== '') {
      updateData.user_name = userData.user_name.toLowerCase();
    }
    if (userData.user_email && userData.user_email.trim() !== '') {
      updateData.user_email = userData.user_email.toLowerCase();
    }
    if (userData.user_type && userData.user_type.trim() !== '') {
      updateData.user_type = userData.user_type.toLowerCase();
    }
    if (userData.user_role && userData.user_role.trim() !== '') {
      updateData.user_role = userData.user_role.toLowerCase();
    }

    // Only include password if it's provided and not empty
    if (userData.password && userData.password.trim() !== '') {
      updateData.password = userData.password.toLowerCase();
    }

    const params = new URLSearchParams({ user_phone: phone, ...updateData } as any);
    console.log('Update API URL:', `/user/user?${params.toString()}`);
    const response = await api.patch(`/user/user?${params.toString()}`);
    return response.data;
  },

  deleteUser: async (phone: string) => {
    const response = await api.delete(`/user/user?user_phone=${phone}`);
    return response.data;
  },
};