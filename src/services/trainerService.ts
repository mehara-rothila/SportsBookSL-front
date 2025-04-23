// src/services/trainerService.ts
import api from './api';
import { FacilityDetails } from './facilityService'; // Import if needed for associatedFacilities

// --- Interfaces ---
export interface Trainer {
    _id: string;
    name: string;
    specialization: string;
    sports: string[];
    location: string;
    profileImage?: string;
    rating?: number;
    reviewCount?: number;
    hourlyRate: number;
    experienceYears: number;
    availability?: string[];
    certifications?: string[];
    bio: string;
    languages?: string[];
    associatedFacilities?: Partial<FacilityDetails>[] | string[]; // Can be populated or just IDs
    userAccount?: string; // User ID
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    reviews?: any[]; // Define Review interface if needed
}

export interface TrainersApiResponse {
    trainers: Trainer[];
    page: number;
    pages: number;
    count: number;
}

// Interface for Admin List Item
export interface AdminTrainerListItem {
    _id: string;
    name: string;
    specialization: string;
    location: string;
    hourlyRate: number;
    rating?: number;
    isActive?: boolean;
    profileImage?: string;
    createdAt?: string;
}

export interface AdminTrainersApiResponse {
    trainers: AdminTrainerListItem[];
    // Add pagination later if needed
}

// Interface for Create/Update Form Data
export interface TrainerFormData {
    name: string;
    specialization: string;
    sports: string; // Comma-separated
    location: string;
    hourlyRate: number | string; // Allow string from form input
    experienceYears: number | string; // Allow string from form input
    bio: string;
    languages?: string; // Comma-separated
    availability?: string; // Comma-separated
    isActive?: boolean;
    // associatedFacilities?: string; // Comma-separated IDs - handle later if needed
}


// --- Public Functions ---
export const getTrainers = async (params = {}): Promise<TrainersApiResponse> => {
  try {
    // console.log("Fetching trainers with params:", params); // Optional log
    const response = await api.get<TrainersApiResponse>('/trainers', { params });
    // console.log("Trainer list response:", response.data); // Optional log
    return response.data || { trainers: [], page: 1, pages: 1, count: 0 };
  } catch (error: any) {
    console.error("Error in getTrainers service:", error);
    const errorMessage = error.response?.data?.message || 'Error fetching trainers list';
    throw new Error(errorMessage);
  }
};
export const getTrainerById = async (id: string): Promise<Trainer> => {
  if (!id) throw new Error("Trainer ID is required");
  try {
    // console.log(`Fetching trainer by ID: ${id}`); // Optional log
    const response = await api.get<Trainer>(`/trainers/${id}`);
    // console.log("Trainer detail response:", response.data); // Optional log
    return response.data;
  } catch (error: any) {
    console.error(`Error in getTrainerById service for ID ${id}:`, error);
    const errorMessage = error.response?.data?.message || 'Error fetching trainer details';
    throw new Error(errorMessage);
  }
};
export const getTrainerReviews = async (id: string, page = 1, limit = 10): Promise<any> => {
   if (!id) throw new Error("Trainer ID is required for fetching reviews");
   try {
    //  console.log(`Fetching reviews for trainer ID: ${id}, page: ${page}`); // Optional log
     const response = await api.get<any>(`/trainers/${id}/reviews`, {
       params: { pageNumber: page, limit }
     });
    //  console.log("Trainer reviews response:", response.data); // Optional log
     return response.data || { reviews: [], page: 1, pages: 1, count: 0 };
   } catch (error: any) {
     console.error(`Error in getTrainerReviews service for ID ${id}:`, error);
     const errorMessage = error.response?.data?.message || 'Error fetching trainer reviews';
     throw new Error(errorMessage);
   }
};
export const bookSession = async (trainerId: string, bookingData: any): Promise<any> => {
  if (!trainerId) throw new Error("Trainer ID is required for booking");
  try {
    // console.log(`Booking session for trainer ID: ${trainerId}`, bookingData); // Optional log
    const response = await api.post(`/trainers/${trainerId}/book`, bookingData);
    // console.log("Book session response:", response.data); // Optional log
    const bookingId = response.data?._id || response.data?.booking?._id || `TB-${Date.now()}`;
    return { ...response.data, _id: bookingId };
  } catch (error: any) {
    console.error(`Error in bookSession service for trainer ID ${trainerId}:`, error);
    const errorMessage = error.response?.data?.message || 'Error booking session';
    throw new Error(errorMessage);
  }
};
export const addTrainerReview = async (trainerId: string, reviewData: any): Promise<any> => {
  if (!trainerId) throw new Error("Trainer ID is required for adding a review");
  try {
    // console.log(`Adding review for trainer ID: ${trainerId}`, reviewData); // Optional log
    const response = await api.post(`/trainers/${trainerId}/reviews`, reviewData);
    // console.log("Add review response:", response.data); // Optional log
    return response.data;
  } catch (error: any) {
    console.error(`Error in addTrainerReview service for trainer ID ${trainerId}:`, error);
    const errorMessage = error.response?.data?.message || 'Error adding review';
    throw new Error(errorMessage);
  }
};


// --- ADMIN Functions ---

export const getAllAdminTrainers = async (): Promise<AdminTrainersApiResponse> => {
    try {
        console.log("Service: Getting all trainers for admin");
        const response = await api.get<AdminTrainersApiResponse>('/admin/trainers');
        console.log("Service: Get all admin trainers response:", response.data);
        return response.data || { trainers: [] };
    } catch (error: any) {
        console.error("Get All Admin Trainers Service Error:", error.response?.data || error.message);
        if (error.response) { console.error("Error Response Data (getAllAdminTrainers):", error.response.data); }
        else if (error.request) { console.error("Error Request Data (getAllAdminTrainers):", error.request); }
        else { console.error("Error Message (getAllAdminTrainers):", error.message); }
        throw new Error(error.response?.data?.message || 'Error fetching trainers list for admin');
    }
};

export const getAdminTrainerById = async (trainerId: string): Promise<Trainer> => {
    if (!trainerId) throw new Error("Trainer ID is required");
    try {
        console.log(`Service: Admin getting trainer by ID: ${trainerId}`);
        const response = await api.get<Trainer>(`/admin/trainers/${trainerId}`);
        console.log("Service: Admin get trainer details response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Admin Get Trainer By ID Service Error (ID: ${trainerId}):`, error.response?.data || error.message);
        if (error.response) { console.error("Error Response Data (getAdminTrainerById):", error.response.data); }
        else if (error.request) { console.error("Error Request Data (getAdminTrainerById):", error.request); }
        else { console.error("Error Message (getAdminTrainerById):", error.message); }
        throw new Error(error.response?.data?.message || 'Error fetching trainer details for admin');
    }
};

export const createTrainer = async (trainerData: TrainerFormData, imageFile?: File | null): Promise<Trainer> => {
    const formData = new FormData();
    Object.entries(trainerData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
             formData.append(key, String(value));
        }
    });
    if (imageFile) {
        formData.append('profileImage', imageFile); // Field name matches Multer config
    }

    // **** ADD FORM DATA LOGGING ****
    console.log("Service: Creating trainer - Inspecting FormData BEFORE sending:");
    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`  FormData -> ${key}: File(name=${value.name}, size=${value.size}, type=${value.type})`);
        } else {
            console.log(`  FormData -> ${key}: ${value}`);
        }
    }
    // **** END LOGGING ****

    try {
        console.log("Service: Admin creating trainer with FormData...");
        const response = await api.post<Trainer>('/admin/trainers', formData); // Axios handles Content-Type
        console.log("Service: Admin create trainer response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Admin Create Trainer Service Error:", error.response?.data || error.message);
        if (error.response) { console.error("Error Response Data (createTrainer):", error.response.data); }
        else if (error.request) { console.error("Error Request Data (createTrainer):", error.request); }
        else { console.error("Error Message (createTrainer):", error.message); }
        throw new Error(error.response?.data?.message || 'Error creating trainer');
    }
};

export const updateTrainerByAdmin = async (trainerId: string, trainerData: Partial<TrainerFormData>, imageFile?: File | null): Promise<Trainer> => {
    if (!trainerId) throw new Error("Trainer ID is required for update.");
    const formData = new FormData();
    Object.entries(trainerData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
             formData.append(key, String(value));
        }
    });
    if (imageFile) {
        formData.append('profileImage', imageFile);
    }

    // **** ADD FORM DATA LOGGING ****
    console.log(`Service: Updating trainer ${trainerId} - Inspecting FormData BEFORE sending:`);
     for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`  FormData -> ${key}: File(name=${value.name}, size=${value.size}, type=${value.type})`);
        } else {
            console.log(`  FormData -> ${key}: ${value}`);
        }
    }
    // **** END LOGGING ****

    try {
        console.log(`Service: Admin updating trainer ${trainerId} with FormData...`);
        const response = await api.put<Trainer>(`/admin/trainers/${trainerId}`, formData); // Axios handles Content-Type
        console.log("Service: Admin update trainer response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Admin Update Trainer Service Error (ID: ${trainerId}):`, error.response?.data || error.message);
        if (error.response) { console.error("Error Response Data (updateTrainer):", error.response.data); }
        else if (error.request) { console.error("Error Request Data (updateTrainer):", error.request); }
        else { console.error("Error Message (updateTrainer):", error.message); }
        throw new Error(error.response?.data?.message || 'Error updating trainer');
    }
};

export const deleteTrainerByAdmin = async (trainerId: string): Promise<{ message: string }> => {
    if (!trainerId) throw new Error("Trainer ID is required for deletion.");
    try {
        console.log(`Service: Admin deleting trainer ${trainerId}`);
        const response = await api.delete<{ message: string }>(`/admin/trainers/${trainerId}`);
        console.log("Service: Admin delete trainer response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Admin Delete Trainer Service Error (ID: ${trainerId}):`, error.response?.data || error.message);
         if (error.response) { console.error("Error Response Data (deleteTrainer):", error.response.data); }
         else if (error.request) { console.error("Error Request Data (deleteTrainer):", error.request); }
         else { console.error("Error Message (deleteTrainer):", error.message); }
        throw new Error(error.response?.data?.message || 'Error deleting trainer');
    }
};