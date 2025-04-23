// src/services/reviewService.ts
import api from './api';

// --- Define or Import Interfaces ---
interface ReviewUser {
    _id?: string;
    id?: string;
    name: string;
    avatar?: string;
}

interface Review {
    _id: string;
    id?: string;
    user: ReviewUser | string; // Can be populated or just ID string
    facility?: string; // Facility ID
    trainer?: string; // Trainer ID
    rating: number;
    content: string;
    reviewDate: string; // Or Date
    createdAt?: string; // Or Date
    updatedAt?: string; // Or Date
}

interface AddReviewData {
    rating: number;
    content: string;
}

// Response structure from the backend when adding a review
interface AddReviewResponse {
    message: string;
    review: Review; // The newly created review object
}

// Response structure for fetching reviews (assuming pagination)
interface GetReviewsResponse {
    reviews: Review[];
    page: number;
    pages: number;
    count: number;
}
// --- End Interfaces ---

/**
 * Add a review for a specific facility.
 * Requires authentication (token handled by api.ts interceptor).
 * @param facilityId - The ID of the facility being reviewed.
 * @param reviewData - The review rating and content.
 * @returns Promise resolving to the backend response including the new review.
 */
export const addFacilityReview = async (facilityId: string, reviewData: AddReviewData): Promise<AddReviewResponse> => {
    if (!facilityId) throw new Error("Facility ID is required");
    if (!reviewData || reviewData.rating == null || !reviewData.content) {
        throw new Error("Rating and content are required for the review");
    }

    try {
        console.log(`Service: Adding review for facility ID: ${facilityId}`, reviewData);

        // **** FIX: Send as plain JSON object ****
        const response = await api.post<AddReviewResponse>(
            `/facilities/${facilityId}/reviews`,
            reviewData // Send the JS object directly, Axios handles Content-Type: application/json
        );
        // **** END FIX ****

        console.log("Service: Add facility review response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Add Facility Review Service Error (Facility ID: ${facilityId}):`, error.response?.data || error.message);
        // Throw the specific error message from backend if available
        throw new Error(error.response?.data?.message || 'Error submitting facility review');
    }
};

/**
 * Add a review for a specific trainer.
 * Requires authentication (token handled by api.ts interceptor).
 * @param trainerId - The ID of the trainer being reviewed.
 * @param reviewData - The review rating and content.
 * @returns Promise resolving to the backend response including the new review.
 */
export const addTrainerReview = async (trainerId: string, reviewData: AddReviewData): Promise<AddReviewResponse> => {
    if (!trainerId) throw new Error("Trainer ID is required");
     if (!reviewData || reviewData.rating == null || !reviewData.content) {
        throw new Error("Rating and content are required for the review");
    }
    try {
        console.log(`Service: Adding review for trainer ID: ${trainerId}`, reviewData);

        // **** FIX: Send as plain JSON object ****
        const response = await api.post<AddReviewResponse>(
            `/trainers/${trainerId}/reviews`,
            reviewData // Send the JS object directly, Axios handles Content-Type: application/json
        );
        // **** END FIX ****

        console.log("Service: Add trainer review response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Add Trainer Review Service Error (Trainer ID: ${trainerId}):`, error.response?.data || error.message);
        // Throw the specific error message from backend if available
        throw new Error(error.response?.data?.message || 'Error submitting trainer review');
    }
};

/**
 * Fetch reviews for a specific facility with pagination.
 * @param {string} id - The ID of the facility.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of reviews per page.
 * @returns {Promise<GetReviewsResponse>} - Promise resolving to the reviews data.
 */
export const getFacilityReviews = async (id: string, page: number = 1, limit: number = 10): Promise<GetReviewsResponse> => {
   if (!id) throw new Error("Facility ID is required for fetching reviews");
   try {
     console.log(`Service: Fetching reviews for facility ID: ${id}, page: ${page}, limit: ${limit}`);
     const response = await api.get<GetReviewsResponse>(`/facilities/${id}/reviews`, {
       params: { pageNumber: page, limit } // Use pageNumber as expected by backend
     });
     console.log("Service: Facility reviews response:", response.data);
     return response.data || { reviews: [], page: 1, pages: 1, count: 0 };
   } catch (error: any) {
     console.error(`Get Facility Reviews Service Error (ID: ${id}):`, error.response?.data || error.message);
     throw new Error(error.response?.data?.message || 'Error fetching facility reviews');
   }
};

/**
 * Fetch reviews for a specific trainer with pagination.
 * @param {string} id - The ID of the trainer.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of reviews per page.
 * @returns {Promise<GetReviewsResponse>} - Promise resolving to the reviews data.
 */
export const getTrainerReviews = async (id: string, page: number = 1, limit: number = 10): Promise<GetReviewsResponse> => {
   if (!id) throw new Error("Trainer ID is required for fetching reviews");
   try {
     console.log(`Service: Fetching reviews for trainer ID: ${id}, page: ${page}, limit: ${limit}`);
     const response = await api.get<GetReviewsResponse>(`/trainers/${id}/reviews`, {
       params: { pageNumber: page, limit }
     });
     console.log("Service: Trainer reviews response:", response.data);
     return response.data || { reviews: [], page: 1, pages: 1, count: 0 };
   } catch (error: any) {
     console.error(`Get Trainer Reviews Service Error (ID: ${id}):`, error.response?.data || error.message);
     throw new Error(error.response?.data?.message || 'Error fetching trainer reviews');
   }
};