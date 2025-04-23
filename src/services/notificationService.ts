// src/services/notificationService.ts
import api from './api'; // Adjust path if needed

// --- Interfaces ---

// Define the structure of a single notification received from the API
export interface Notification {
  _id: string;
  user: string; // User ID
  type: string; // Use the specific enum later if needed
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
   // Add populated related fields if the backend sends them
   relatedBooking?: { _id: string }; // Example
   relatedUser?: { _id: string; name: string; }; // Example
}

// Define the structure of the GET /notifications response
interface GetNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  // Include pagination fields if your backend returns them
  // currentPage?: number;
  // totalPages?: number;
}

// Define the structure for the Mark Read response
interface MarkReadResponse {
    success: boolean;
    message: string;
    unreadCount: number; // Important for updating UI badge
}

// Define the structure for the Delete response
interface DeleteResponse {
    success: boolean;
    message: string;
    unreadCount: number; // Important for updating UI badge
}

// --- Service Functions ---

/**
 * Fetches notifications for the logged-in user.
 * @param params - Optional parameters like page or limit.
 * @returns Promise resolving to the API response containing notifications and unread count.
 */
export const getUserNotifications = async (params = {}): Promise<GetNotificationsResponse> => {
  try {
    console.log("Service: Getting user notifications with params:", params);
    const response = await api.get<GetNotificationsResponse>('/notifications', { params });
    console.log("Service: Get notifications response:", response.data);
    // Provide default structure if backend sends null/undefined
    return response.data || { notifications: [], unreadCount: 0 };
  } catch (error: any) {
    console.error("Get User Notifications Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching notifications');
  }
};

/**
 * Marks specific notifications or all notifications as read for the logged-in user.
 * @param data - An object containing either { notificationIds: string[] } or { markAll: true }.
 * @returns Promise resolving to the API response with the updated unread count.
 */
export const markNotificationsRead = async (data: { notificationIds?: string[], markAll?: boolean }): Promise<MarkReadResponse> => {
  if (!data || (!data.notificationIds && !data.markAll)) {
      throw new Error("Either notificationIds array or markAll:true must be provided.");
  }
  try {
    console.log("Service: Marking notifications as read:", data);
    const response = await api.put<MarkReadResponse>('/notifications/mark-read', data);
    console.log("Service: Mark read response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Mark Notifications Read Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error marking notifications as read');
  }
};

/**
 * Deletes a specific notification for the logged-in user.
 * @param notificationId - The ID of the notification to delete.
 * @returns Promise resolving to the API response with the updated unread count.
 */
export const deleteNotification = async (notificationId: string): Promise<DeleteResponse> => {
  if (!notificationId) throw new Error("Notification ID is required for deletion.");
  try {
    console.log(`Service: Deleting notification ID: ${notificationId}`);
    const response = await api.delete<DeleteResponse>(`/notifications/${notificationId}`);
    console.log("Service: Delete notification response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Delete Notification Service Error (ID: ${notificationId}):`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error deleting notification');
  }
};