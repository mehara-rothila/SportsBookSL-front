// src/services/donationService.ts
import api from './api';

// --- Interfaces ---

// Interface for the data sent TO the backend for making a donation (Public User Action)
interface MakeDonationData {
    amount: number;
    isAnonymous: boolean;
    donorName?: string;
    donorEmail: string;
    message?: string;
}

// Interface for the response FROM the backend after making a donation
interface DonationResponse {
    message: string;
    donationId: string;
    athleteId: string;
    raisedAmount: number;
    goalAmount: number;
}

// Interface for the data structure of a success story athlete (Public View)
interface SuccessStoryAthlete {
    _id: string;
    name: string;
    sport: string;
    image: string;
    raisedAmount: number;
    goalAmount: number;
    story?: string;
    achievements?: string[];
}

// Interface for Admin List Item
export interface AdminDonationListItem {
    _id: string;
    donorUser?: { _id: string; name: string; email: string; }; // Populated Donor Info
    athlete?: { _id: string; name: string; sport: string; };    // Populated Athlete Info
    amount: number;
    donationDate: string; // Or Date
    paymentStatus: 'pending' | 'succeeded' | 'failed';
    paymentGateway?: string;
    paymentIntentId?: string;
    isAnonymous: boolean;
    message?: string;
    createdAt?: string; // Or Date
}

// Interface for Admin List API Response
export interface AdminDonationsApiResponse {
    donations: AdminDonationListItem[];
    page: number;
    pages: number;
    count: number;
}
// --- End Interfaces ---


// --- Public Service Functions ---
export const makeDonation = async (athleteId: string, donationData: MakeDonationData): Promise<DonationResponse> => {
    if (!athleteId) { throw new Error("Athlete ID is required to make a donation."); }
    try { console.log(`Service: Making donation to athlete ${athleteId}`, donationData); const response = await api.post<DonationResponse>(`/donations/athletes/${athleteId}/donate`, donationData); console.log("Service: Make donation response:", response.data); return response.data; } catch (error: any) { console.error(`Make Donation Service Error (Athlete ID: ${athleteId}):`, error.response?.data || error.message); throw new Error(error.response?.data?.message || 'Error processing donation'); }
};

export const getSuccessStories = async (): Promise<SuccessStoryAthlete[]> => {
    try { console.log("Service: Fetching success stories"); const response = await api.get<SuccessStoryAthlete[]>('/donations/success-stories'); console.log("Service: Success stories response:", response.data); return response.data || []; } catch (error: any) { console.error("Get Success Stories Service Error:", error.response?.data || error.message); throw new Error(error.response?.data?.message || 'Error fetching success stories'); }
};


// --- ADMIN FUNCTION ---

/**
 * Fetches all donations for the admin panel with pagination.
 * Requires admin authentication token.
 * @param params - Query parameters for pagination (e.g., { page: 1, limit: 20 })
 */
export const getAllAdminDonations = async (params = {}): Promise<AdminDonationsApiResponse> => {
    try {
        console.log("Service: Getting all admin donations with params:", params);
        // **ASSUMPTION:** Backend endpoint is GET /api/admin/donations
        const response = await api.get<AdminDonationsApiResponse>('/admin/donations', { params });
        console.log("Service: Get all admin donations response:", response.data);
        // Provide default structure if response.data is unexpectedly empty
        return response.data || { donations: [], page: 1, pages: 1, count: 0 };
    } catch (error: any) {
        console.error("Get All Admin Donations Service Error:", error.response?.data || error.message);
        // Ensure an Error object is thrown
        throw new Error(error.response?.data?.message || 'Error fetching donations list for admin');
    }
};

// TODO: Add other donation-related admin service functions here if needed
// e.g., getAdminDonationDetails, updateDonationStatus, processRefund, etc.