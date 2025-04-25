// src/services/userService.ts
import api from './api';
import { updateLocalUserInfo } from './authService';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';

// --- Interfaces ---
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  joined?: string;
  createdAt?: string;
  sportPreferences?: string[];
  role?: 'user' | 'admin' | 'trainer' | 'facilityOwner';
}

interface FavoriteFacility {
  _id: string;
  name: string;
  image?: string;
  images?: string[];
  location: string;
  sportTypes?: string[];
  rating?: number;
}

interface FinancialAidAppSummary {
  _id: string;
  submittedDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_info';
  sportsInfo?: { primarySport?: string };
}

// Interface for Admin User List Item
interface AdminUserListItem {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'trainer' | 'facilityOwner';
    createdAt: string;
    phone?: string;
    avatar?: string;
}

// Interface for Admin User List API Response
interface AdminUsersResponse {
    users: AdminUserListItem[];
}

// Interface for Admin Update Data
interface AdminUpdateUserData {
    name?: string;
    email?: string;
    phone?: string;
    role?: 'user' | 'admin' | 'trainer' | 'facilityOwner';
    address?: string;
}

// Interface for User Donation History
interface UserDonation {
    _id: string;
    athlete?: { _id: string; name: string; };
    amount: number;
    donationDate: string;
    paymentStatus: string;
    isAnonymous: boolean;
}

// --- Helper Functions ---
/**
 * Helper function to get the full avatar URL
 */
export const getAvatarUrl = (avatarPath?: string): string | null => {
  if (!avatarPath) return null;
  
  // Handle different avatar path formats
  if (avatarPath.startsWith('http')) {
    // Already a complete URL
    return avatarPath;
  } else {
    // Ensure backend base URL has trailing slash
    const baseUrl = BACKEND_BASE_URL.endsWith('/') ? BACKEND_BASE_URL : `${BACKEND_BASE_URL}/`;
    // Remove leading slash from avatar path if exists
    const cleanPath = avatarPath.startsWith('/') ? avatarPath.substring(1) : avatarPath;
    // Construct full URL
    return `${baseUrl}${cleanPath}`;
  }
};

// --- Service Functions ---

/**
 * Fetches the profile of the currently logged-in user.
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    console.log("Service: Getting user profile");
    const response = await api.get<UserProfile>('/users/profile');
    console.log("Service: Get user profile response:", response.data);
    
    // Update localStorage with fresh user data including avatar
    updateLocalUserInfo({
      name: response.data.name,
      email: response.data.email,
      avatar: response.data.avatar,
      role: response.data.role
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Get User Profile Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching user profile');
  }
};

/**
 * Updates the profile of the currently logged-in user (text fields).
 */
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    console.log("Service: Updating user profile with data:", profileData);
    const response = await api.put<UserProfile>('/users/profile', profileData);
    console.log("Service: Update user profile response:", response.data);
    
    // Update localStorage with the updated user info
    updateLocalUserInfo({
      name: response.data.name,
      email: response.data.email,
      phone: response.data.phone,
      address: response.data.address,
      avatar: response.data.avatar,
      role: response.data.role
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Update User Profile Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error updating user profile');
  }
};

/**
 * Uploads a new avatar image for the currently logged-in user.
 */
export const uploadUserAvatar = async (avatarFile: File): Promise<UserProfile> => {
  if (!avatarFile) { 
    throw new Error("No avatar file provided."); 
  }
  
  // Basic client-side validation
  if (avatarFile.size > 2 * 1024 * 1024) { // 2MB limit
    throw new Error("Avatar file is too large. Maximum size is 2MB.");
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(avatarFile.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.");
  }
  
  const formData = new FormData();
  formData.append('avatar', avatarFile);
  
  try {
    console.log("Service: Uploading user avatar...");
    console.log("Service: Avatar file details:", {
      name: avatarFile.name,
      type: avatarFile.type,
      size: `${(avatarFile.size / 1024).toFixed(2)} KB`
    });
    
    // Log the FormData (for debugging)
    console.log("Service: FormData created with avatar field");
    
    const response = await api.put<UserProfile>('/users/profile/avatar', formData);
    console.log("Service: Upload avatar response:", response.data);
    
    // Update localStorage with the new avatar
    updateLocalUserInfo({
      avatar: response.data.avatar
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Upload User Avatar Service Error:", error);
    
    // Provide more detailed error information
    if (error.response) {
      console.error("Server response status:", error.response.status);
      console.error("Server response data:", error.response.data);
      throw new Error(error.response.data?.message || `Error uploading avatar (${error.response.status})`);
    } else if (error.request) {
      console.error("No response received from server");
      throw new Error("Server did not respond to avatar upload request");
    } else {
      console.error("Error message:", error.message);
      throw new Error(error.message || 'Error uploading avatar');
    }
  }
};

/**
 * Removes the avatar of the currently logged-in user.
 */
export const removeUserAvatar = async (): Promise<UserProfile> => {
  try {
    console.log("Service: Removing user avatar...");
    // Send a DELETE request to remove avatar
    const response = await api.delete<UserProfile>('/users/profile/avatar');
    console.log("Service: Remove avatar response:", response.data);
    
    // Update localStorage to remove the avatar
    updateLocalUserInfo({
      avatar: undefined
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Remove User Avatar Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error removing avatar');
  }
};

/**
 * Fetches the favorite facilities of the currently logged-in user.
 */
export const getUserFavorites = async (): Promise<FavoriteFacility[]> => {
  try {
    console.log("Service: Getting user favorites");
    const response = await api.get<FavoriteFacility[]>('/users/favorites');
    console.log("Service: Get user favorites response:", response.data);
    return response.data || [];
  } catch (error: any) {
    console.error("Get User Favorites Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching user favorites');
  }
};

/**
 * Adds a facility to the user's favorites.
 */
export const addFavorite = async (facilityId: string): Promise<FavoriteFacility[]> => {
   if (!facilityId) throw new Error("Facility ID is required to add favorite");
   try {
    console.log(`Service: Adding favorite facility ID: ${facilityId}`);
    const response = await api.post<FavoriteFacility[]>('/users/favorites', { facilityId });
    console.log("Service: Add favorite response:", response.data);
    return response.data || [];
  } catch (error: any) {
    console.error(`Add Favorite Service Error (Facility ID: ${facilityId}):`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error adding favorite');
  }
};

/**
 * Removes a facility from the user's favorites.
 */
export const removeFavorite = async (facilityId: string): Promise<FavoriteFacility[]> => {
  if (!facilityId) throw new Error("Facility ID is required to remove favorite");
  try {
    console.log(`Service: Removing favorite facility ID: ${facilityId}`);
    const response = await api.delete<FavoriteFacility[]>(`/users/favorites/${facilityId}`);
    console.log("Service: Remove favorite response:", response.data);
    return response.data || [];
  } catch (error: any) {
    console.error(`Remove Favorite Service Error (Facility ID: ${facilityId}):`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error removing favorite');
  }
};

/**
 * Fetches the financial aid applications submitted by the currently logged-in user.
 */
export const getUserFinancialAidApps = async (): Promise<FinancialAidAppSummary[]> => {
  try {
    console.log("Service: Getting user financial aid applications");
    const response = await api.get<FinancialAidAppSummary[]>('/users/financial-aid');
    console.log("Service: Get user financial aid apps response:", response.data);
    return response.data || [];
  } catch (error: any) {
    console.error("Get User Financial Aid Apps Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching financial aid applications');
  }
};

/**
 * Fetches the donation history of the currently logged-in user.
 */
export const getUserDonationHistory = async (): Promise<UserDonation[]> => {
  try {
    console.log("Service: Getting user donation history");
    const response = await api.get<UserDonation[]>('/users/donations/history');
    console.log("Service: Get donation history response:", response.data);
    return response.data || [];
  } catch (error: any) {
    console.error("Get User Donation History Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching donation history');
  }
};

// **** ADMIN FUNCTIONS ****

/**
 * Fetches all users (Admin only).
 */
export const getAllAdminUsers = async (): Promise<AdminUsersResponse> => {
  try {
    console.log("Service: Getting all users for admin");
    const response = await api.get<AdminUsersResponse>('/admin/users');
    console.log("Service: Get all users response:", response.data);
    return response.data || { users: [] };
  } catch (error: any) {
    console.error("Get All Admin Users Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching users list');
  }
};

/**
 * Updates a user's details (Admin only).
 * @param userId - The ID of the user to update.
 * @param userData - An object containing the fields to update.
 */
export const updateUserByAdmin = async (userId: string, userData: AdminUpdateUserData): Promise<AdminUserListItem> => {
    if (!userId) throw new Error("User ID is required for update");
    try {
        console.log(`Service: Admin updating user ${userId} with data:`, userData);
        const response = await api.put<AdminUserListItem>(`/admin/users/${userId}`, userData);
        console.log("Service: Admin update user response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Admin Update User Service Error (User ID: ${userId}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error updating user');
    }
};

/**
 * Deletes a user (Admin only).
 * @param userId - The ID of the user to delete.
 */
export const deleteUserByAdmin = async (userId: string): Promise<{ message: string }> => {
    if (!userId) throw new Error("User ID is required for deletion");
    try {
        console.log(`Service: Admin deleting user ${userId}`);
        const response = await api.delete<{ message: string }>(`/admin/users/${userId}`);
        console.log("Service: Admin delete user response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Admin Delete User Service Error (User ID: ${userId}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error deleting user');
    }
};

export default {
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  removeUserAvatar,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  getUserFinancialAidApps,
  getUserDonationHistory,
  getAllAdminUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
  getAvatarUrl
};