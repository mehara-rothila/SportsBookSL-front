// src/services/bookingService.ts
import api from './api';

// --- Define or Import Interfaces ---

// Interface for detailed booking data, often returned by GET /bookings/:id
// or after creation/update
export interface Booking { // <-- ADD 'export' HERE    _id: string;
    bookingId?: string;
    user: string | { _id: string; name: string; email: string; }; // Can be populated
    facility?: { _id: string; name: string; address?: string; images?: string[]; location?: string; pricePerHourValue?: number; } | string; // Can be populated or just ID
    trainer?: { _id: string; name: string; specialization?: string; profileImage?: string; } | string; // Can be populated or just ID
    date: string; // Or Date
    timeSlot: string;
    durationHours: number;
    participants: number;
    rentedEquipment?: { equipmentName: string; quantity: number; pricePerItemPerHour: number; }[];
    needsTransportation?: boolean;
    specialRequests?: string;
    facilityCost?: number;
    equipmentCost?: number;
    transportationCost?: number;
    trainerCost?: number;
    totalCost: number;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    status: 'upcoming' | 'completed' | 'cancelled' | 'no-show';
    createdAt?: string; // Or Date
    updatedAt?: string; // Or Date
    bookingType?: 'facility' | 'trainer'; // Added for frontend use
}

// Interface for data needed to create a booking
interface CreateBookingData {
    facility?: string; // Facility ID
    trainer?: string; // Trainer ID
    date: string; // YYYY-MM-DD
    timeSlot: string; // HH:MM-HH:MM
    participants: number;
    rentedEquipment?: { equipmentName: string; quantity: number }[];
    needsTransportation?: boolean;
    specialRequests?: string;
    sessionHours?: number; // For trainer bookings
    // Costs are calculated backend
}

// Interface for the response when cancelling a booking
interface CancelResponse {
    message: string;
    booking: Booking;
}

// Interface for items in the admin booking list
// Include necessary populated fields from the backend
interface AdminBookingListItem {
    _id: string;
    bookingId?: string;
    user: { _id: string; name: string; email: string; }; // Assume populated user
    facility?: { _id: string; name: string; }; // Assume populated facility
    trainer?: { _id: string; name: string; }; // Assume populated trainer
    date: string; // Or Date
    timeSlot: string;
    totalCost: number;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    status: 'upcoming' | 'completed' | 'cancelled' | 'no-show';
    bookingType?: 'facility' | 'trainer';
    createdAt?: string; // Or Date
}

// Interface for the API response for admin bookings list
interface AdminBookingsApiResponse {
    bookings: AdminBookingListItem[];
    page: number;
    pages: number;
    count: number;
}

// --- End Interfaces ---


/**
 * Create a new facility or trainer booking.
 * @param bookingData - Data for the booking.
 */
export const createBooking = async (bookingData: CreateBookingData): Promise<Booking> => {
  try {
    console.log("Service: Creating booking with data:", bookingData);
    // Backend determines type based on presence of facility/trainer ID
    const response = await api.post<Booking>('/bookings', bookingData);
    console.log("Service: Create booking response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Create Booking Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error creating booking');
  }
};

/**
 * Get booking details by its ID.
 * @param id - The ID of the booking.
 */
export const getBookingById = async (id: string): Promise<Booking> => {
  if (!id) throw new Error("Booking ID is required");
  try {
    console.log(`Service: Getting booking by ID: ${id}`);
    const response = await api.get<Booking>(`/bookings/${id}`);
    console.log("Service: Get booking by ID response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Get Booking By ID Service Error (ID: ${id}):`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching booking details');
  }
};

/**
 * Get booking confirmation details (often same as getBookingById).
 * @param id - The ID of the booking.
 */
export const getBookingConfirmation = async (id: string): Promise<Booking> => {
  if (!id) throw new Error("Booking ID is required");
   try {
    console.log(`Service: Getting booking confirmation for ID: ${id}`);
    // Assuming confirmation uses the standard booking detail endpoint
    const response = await api.get<Booking>(`/bookings/${id}`);
    // Or use: const response = await api.get<Booking>(`/bookings/confirmation/${id}`);
    console.log("Service: Get booking confirmation response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Get Booking Confirmation Service Error (ID: ${id}):`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching booking confirmation');
  }
};

/**
 * Cancel a specific booking.
 * @param id - The ID of the booking to cancel.
 */
export const cancelBooking = async (id: string): Promise<CancelResponse> => {
  if (!id) throw new Error("Booking ID is required");
  try {
    console.log(`Service: Cancelling booking ID: ${id}`);
    const response = await api.put<CancelResponse>(`/bookings/${id}/cancel`);
    console.log("Service: Cancel booking response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Cancel Booking Service Error (ID: ${id}):`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error canceling booking');
  }
};

/**
 * Get bookings for the currently logged-in user.
 */
export const getUserBookings = async (): Promise<Booking[]> => {
  console.log("Service: Attempting to get user bookings..."); // Log start
  try {
    // This endpoint is under /users route in the backend
    const response = await api.get<Booking[]>('/users/bookings');
    console.log("Service: Get user bookings API response status:", response.status); // Log status
    // console.log("Service: Get user bookings response data:", response.data); // Log data (can be verbose)
    return response.data || [];
  } catch (error: any) {
    console.error("Get User Bookings Service Error:", error.response?.data || error.message);
    // Log the full error object too
    console.error("Full error object in getUserBookings service:", error);
    // Ensure the error is re-thrown correctly
    throw new Error(error.response?.data?.message || 'Error fetching your bookings');
  } finally {
      console.log("Service: getUserBookings finally block reached.");
  }
};


// **** NEW ADMIN FUNCTIONS ****

/**
 * Fetches all bookings for the admin panel with pagination and filtering.
 * Requires admin authentication token (handled by interceptor).
 * @param params - Query parameters for filtering, sorting, pagination (e.g., { page: 1, limit: 10, status: 'upcoming' })
 */
export const getAllAdminBookings = async (params = {}): Promise<AdminBookingsApiResponse> => {
    try {
        console.log("Service: Getting all admin bookings with params:", params);
        // **ASSUMPTION:** Backend endpoint is GET /api/admin/bookings
        const response = await api.get<AdminBookingsApiResponse>('/admin/bookings', { params });
        console.log("Service: Get all admin bookings response:", response.data);
        return response.data || { bookings: [], page: 1, pages: 1, count: 0 }; // Ensure structure integrity
    } catch (error: any) {
        console.error("Get All Admin Bookings Service Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching bookings list for admin');
    }
};

/**
 * Updates the status of a specific booking (Admin only).
 * Requires admin authentication token.
 * @param bookingId - The ID of the booking to update.
 * @param status - The new status ('upcoming', 'completed', 'cancelled', 'no-show').
 */
export const updateBookingStatusByAdmin = async (bookingId: string, status: Booking['status']): Promise<Booking> => {
    if (!bookingId) throw new Error("Booking ID is required for status update.");
    if (!status) throw new Error("New status is required.");
    try {
        console.log(`Service: Admin updating booking ${bookingId} status to ${status}`);
        // **ASSUMPTION:** Backend endpoint is PUT /api/admin/bookings/:id/status
        const response = await api.put<Booking>(`/admin/bookings/${bookingId}/status`, { status });
        console.log("Service: Admin update booking status response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Admin Update Booking Status Service Error (ID: ${bookingId}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error updating booking status');
    }
};

/**
 * Deletes a booking (Admin only).
 * Requires admin authentication token.
 * @param bookingId - The ID of the booking to delete.
 */
export const deleteBookingByAdmin = async (bookingId: string): Promise<{ message: string }> => {
    if (!bookingId) throw new Error("Booking ID is required for deletion.");
    try {
        console.log(`Service: Admin deleting booking ${bookingId}`);
        // **ASSUMPTION:** Backend endpoint is DELETE /api/admin/bookings/:id
        const response = await api.delete<{ message: string }>(`/admin/bookings/${bookingId}`);
        console.log("Service: Admin delete booking response:", response.data);
        return response.data; // Return success message
    } catch (error: any) {
        console.error(`Admin Delete Booking Service Error (ID: ${bookingId}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error deleting booking');
    }
};