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

export interface GenerateOtpData {
  user_type: string;
  user_phone: string;
  user_role: string;
}

export interface ValidateOtpData {
  user_phone: string;
  user_otp: string;
}

export interface ValidateOtpResponse {
  status: string;
  status_code: number;
  message: string;
  timestamp: string;
  token: string;
  statusbool: boolean;
  ok: boolean;
  api_processing_time: number;
}

export const userApi = {
  getUsers: async (filters?: Record<string, string>): Promise<User[]> => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/user/users${params.toString() ? `?${params.toString()}` : ''}`);

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
      // Convert role values to match API expectations
      const convertedRole = userData.user_role === 'in-bound' ? 'inbound' :
                           userData.user_role === 'all-ops' ? 'all_ops' :
                           userData.user_role;

      const params = new URLSearchParams();
      params.append('user_name', userData.user_name);
      params.append('user_email', userData.user_email);
      params.append('user_type', userData.user_type);
      params.append('user_phone', userData.user_phone);
      params.append('password', userData.password);
      params.append('user_role', convertedRole);

      const response = await api.post(`/user/user?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Create User API Error:', error);
      throw error;
    }
  },

  updateUser: async (phone: string, userData: Partial<CreateUserData>) => {
    try {
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
        // Convert role values to match API expectations
        updateData.user_role = userData.user_role === 'in-bound' ? 'inbound' :
                              userData.user_role === 'all-ops' ? 'all_ops' :
                              userData.user_role;
      }
      if (userData.password && userData.password.trim() !== '') {
        updateData.password = userData.password;
      }

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
      console.log('Fetching user by phone for delete:', phone);
      const users = await userApi.getUserByPhone(phone);

      if (users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];
      console.log('User found:', user);

      const userId = user.id;
      console.log('Using id for delete:', userId);

      if (!userId) {
        throw new Error('id not found in user data');
      }

      const response = await api.delete(`/user/user?record_id=${userId}`);
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete User API Error:', error);
      throw error;
    }
  },

  generateUserOtp: async (otpData: GenerateOtpData) => {
    try {
      // Convert role values to match API expectations
      const convertedRole = otpData.user_role === 'in-bound' ? 'inbound' :
                           otpData.user_role === 'all-ops' ? 'all_ops' :
                           otpData.user_role;

      const params = new URLSearchParams();
      params.append('user_type', otpData.user_type);
      params.append('user_phone', otpData.user_phone);
      params.append('user_role', convertedRole);

      const response = await api.post(`/user/generate_user_otp?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Generate OTP API Error:', error);
      throw error;
    }
  },

  validateWithOtp: async (validateData: ValidateOtpData): Promise<ValidateOtpResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('user_phone', validateData.user_phone);
      params.append('user_otp', validateData.user_otp);

      const response = await api.get(`/user/validate_with_otp?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Validate OTP API Error:', error);
      throw error;
    }
  },
};