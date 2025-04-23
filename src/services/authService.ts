// src/services/authService.ts
import api from './api'; // Import the configured Axios instance

// Define structure for user data stored/returned
interface UserInfo {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
    address?: string;
}

// Define structure for login/register response
interface AuthResponse {
    token: string;
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

const USER_TOKEN_KEY = 'userToken'; // Key for storing token in localStorage
const USER_INFO_KEY = 'user';     // Key for storing user info in localStorage
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';

// Debug function to log user info
const logUserInfo = (info: any, source: string) => {
  console.log(`[AUTH DEBUG - ${source}]`, {
    userInfo: info ? { ...info, token: info.token ? '**exists**' : '**missing**' } : null,
    avatar: info?.avatar ? `${info.avatar} (full: ${BACKEND_BASE_URL}${info.avatar})` : 'none',
    backendBaseUrl: BACKEND_BASE_URL
  });
};

// Register a new user
export const register = async (userData: any): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    console.log("[AUTH DEBUG - register] API Response:", {
      hasToken: !!response.data?.token,
      user: { ...response.data, token: response.data?.token ? '**exists**' : '**missing**' }
    });

    if (response.data?.token) {
      localStorage.setItem(USER_TOKEN_KEY, response.data.token);
      const userInfo: UserInfo = {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          avatar: response.data.avatar,
      };
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
      logUserInfo(userInfo, "register-saved");
      console.log("Token stored after registration");
    } else {
        console.warn("Registration response did not contain a token.");
    }
    return response.data;
  } catch (error: any) {
    console.error("Registration Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'An error occurred during registration');
  }
};

// Login user
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    console.log("[AUTH DEBUG - login] API Response:", {
      hasToken: !!response.data?.token,
      user: { ...response.data, token: response.data?.token ? '**exists**' : '**missing**' }
    });

    if (response.data?.token) {
      localStorage.setItem(USER_TOKEN_KEY, response.data.token);
       const userInfo: UserInfo = {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          avatar: response.data.avatar,
      };
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
      logUserInfo(userInfo, "login-saved");
      console.log("Token stored in localStorage");
    } else {
        console.warn("Login response did not contain a token.");
    }
    return response.data;
  } catch (error: any) {
    console.error("Login Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Invalid email or password');
  }
};

// Logout user
export const logout = () => {
  try {
      if (typeof window !== 'undefined') {
          localStorage.removeItem(USER_TOKEN_KEY);
          localStorage.removeItem(USER_INFO_KEY);
          console.log("Token and user info removed from localStorage");
      }
  } catch (error) {
      console.error("Error during logout:", error);
  }
};

// Get current user info from localStorage
export const getCurrentUser = (): UserInfo | null => {
  try {
      if (typeof window !== 'undefined') {
          const userJson = localStorage.getItem(USER_INFO_KEY);
          if (!userJson) {
            return null;
          }
          const user = JSON.parse(userJson);
          return user;
      }
      return null;
  } catch (error) {
      console.error("Error getting current user from localStorage:", error);
      return null;
  }
};

// Check if user is authenticated based on token presence
export const isAuthenticated = (): boolean => {
  try {
      if (typeof window !== 'undefined') {
          const hasToken = !!localStorage.getItem(USER_TOKEN_KEY);
          return hasToken;
      }
      return false;
  } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
  }
};

// Update user info in localStorage
export const updateLocalUserInfo = (userData: Partial<UserInfo>): void => {
  try {
    if (typeof window !== 'undefined') {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(updatedUser));
        logUserInfo(updatedUser, "updateLocalUserInfo-saved");
        console.log("User info updated in localStorage");
      }
    }
  } catch (error) {
    console.error("Error updating user info in localStorage:", error);
  }
};

// Get current user profile from API (requires token)
export const getUserProfile = async (): Promise<UserInfo> => {
  try {
    const response = await api.get<UserInfo>('/auth/me');
    logUserInfo(response.data, "getUserProfile-api-response");
    updateLocalUserInfo(response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get User Profile Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching user profile');
  }
};

// --- Forgot Password Function ---
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
        console.log(`Service: Requesting password reset for ${email}`);
        const response = await api.post<{ success: boolean; message: string }>('/auth/forgotpassword', { email });
        console.log("Service: Forgot password response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Forgot Password Service Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error requesting password reset');
    }
};

// --- MODIFIED Reset Password Function (Using OTP) ---
export const resetPassword = async (
    email: string,
    otp: string,
    password: string
): Promise<{ success: boolean; message: string }> => {

    if (!email || !otp || !password) {
        throw new Error("Email, OTP, and new password are required.");
    }

    try {
        console.log(`Service: Resetting password for email: ${email} using OTP...`);
        // Backend expects { email, otp, password } in the body
        // The route is now PUT /api/auth/resetpassword (no token in URL)
        const response = await api.put<{ success: boolean; message: string }>(
            `/auth/resetpassword`, // No token in URL
            { email, otp, password } // Send data in body
        );
        console.log("Service: Reset password response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Reset Password Service Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error resetting password. OTP might be invalid or expired.');
    }
};