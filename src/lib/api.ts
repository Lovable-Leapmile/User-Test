import axios from 'axios';

const API_BASE_URL = 'https://testhostharan.leapmile.com';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTc2OTU4MDgzMV0.WRkWCmuO634oFp6BslP5Zi9JmplLoBZWAibU4XQ48_w';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: number;
  record_id: string;
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
    try {
      const response = await api.get(`/user/users?user_phone=${phone}`);
      const data = response.data;

      if (data && data.records && Array.isArray(data.records)) {
        return data.records;
      }
      return [];
    } catch (error) {
      console.error('Get User by Phone API Error:', error);
      throw error;
    }
  },

  createUser: async (userData: CreateUserData) => {
    try {
      // Create the query parameters for the POST request
      const params = new URLSearchParams();
      params.append('user_name', userData.user_name);
      params.append('user_email', userData.user_email);
      params.append('user_type', userData.user_type);
      params.append('user_phone', userData.user_phone);
      params.append('password', userData.password);
      params.append('user_role', userData.user_role);

      console.log('Create User URL:', `/user/user?${params.toString()}`);

      const response = await api.post(`/user/user?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Create User API Error:', error);
      throw error;
    }
  },

  updateUser: async (phone: string, userData: Partial<CreateUserData>) => {
    try {
      // Only include fields that have values and are different from empty
      const updateData: Record<string, string> = {};

      if (userData.user_name && userData.user_name.trim() !== '') {
        updateData.user_name = userData.user_name;
      }
      if (userData.user_email && userData.user_email.trim() !== '') {
        updateData.user_email = userData.user_email;
      }
      if (userData.user_type && userData.user_type.trim() !== '') {
        updateData.user_type = userData.user_type;
      }
      if (userData.user_role && userData.user_role.trim() !== '') {
        updateData.user_role = userData.user_role;
      }
      if (userData.password && userData.password.trim() !== '') {
        updateData.password = userData.password;
      }

      console.log('Update Data:', updateData);

      // If no fields to update, return early
      if (Object.keys(updateData).length === 0) {
        throw new Error('No fields to update');
      }

      const response = await api.patch(`/user/user?user_phone=${phone}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update User API Error:', error);
      throw error;
    }
  },

  deleteUser: async (phone: string) => {
    try {
      // First, get the user details to get the record_id
      console.log('Fetching user details for phone:', phone);
      const users = await userApi.getUserByPhone(phone);

      if (users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];
      const recordId = user.record_id;

      console.log('Deleting user with record_id:', recordId);
      const response = await api.delete(`/user/user?record_id=${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Delete User API Error:', error);
      throw error;
    }
  },
};