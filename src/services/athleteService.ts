// src/services/athleteService.ts
import api from './api';

// --- Interfaces ---
export interface Athlete {
    _id: string;
    id?: string; // Can be included sometimes
    name: string;
    age: number;
    sport: string;
    goalAmount: number;
    raisedAmount?: number; // Optional on create/update if defaulted backend
    image: string; // Should be relative path like /uploads/athletes/...
    achievements?: string[];
    story: string;
    location: string;
    isActive?: boolean;
    isFeatured?: boolean;
    createdAt?: string;
    updatedAt?: string;
    progress?: number; // Frontend calculated or backend virtual
}

// Data structure for the form/API (excluding calculated fields like raisedAmount/progress on create)
export interface AthleteFormData {
    name: string;
    age: number | string; // Allow string from form input
    sport: string;
    goalAmount: number | string; // Allow string from form input
    // raisedAmount?: number | string; // Usually not set manually
    story: string;
    location: string;
    achievements?: string; // Send as comma-separated string from form
    isActive?: boolean;
    isFeatured?: boolean;
    // 'image' field is handled by the File object parameter
}

// Interface for Admin list (could be simpler than full Athlete)
export type AdminAthleteListItem = Pick<Athlete, '_id' | 'name' | 'sport' | 'location' | 'goalAmount' | 'raisedAmount' | 'progress' | 'isActive' | 'image'>;


// --- ADMIN FUNCTIONS ---

/**
 * Fetches all athletes for the admin panel.
 * Requires admin authentication.
 */
export const getAllAdminAthletes = async (): Promise<AdminAthleteListItem[]> => {
    try {
        console.log("Service: Getting all admin athletes");
        // ASSUMPTION: Endpoint returns an array of athletes directly
        const response = await api.get<AdminAthleteListItem[]>('/admin/athletes');
        console.log("Service: Get all admin athletes response count:", response.data?.length);
        return response.data || [];
    } catch (error: any) {
        console.error("Get All Admin Athletes Service Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching athletes for admin');
    }
};

/**
 * Fetches a single athlete's details for admin editing.
 * Requires admin authentication.
 */
export const getAdminAthleteById = async (athleteId: string): Promise<Athlete> => {
     if (!athleteId) throw new Error("Athlete ID is required");
    try {
        console.log(`Service: Admin getting athlete by ID: ${athleteId}`);
        const response = await api.get<Athlete>(`/admin/athletes/${athleteId}`);
        console.log("Service: Admin get athlete details response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Admin Get Athlete By ID Service Error (ID: ${athleteId}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching athlete details for admin');
    }
};


/**
 * Creates a new athlete profile (Admin only).
 * Sends data as multipart/form-data.
 * @param athleteData - Text fields for the athlete.
 * @param imageFile - The image File object for the athlete.
 */
export const createAdminAthlete = async (athleteData: AthleteFormData, imageFile: File): Promise<Athlete> => {
    if (!imageFile) throw new Error("Athlete image file is required.");

    const formData = new FormData();
    // Append all string/boolean fields
    formData.append('name', athleteData.name);
    formData.append('sport', athleteData.sport);
    formData.append('story', athleteData.story);
    formData.append('location', athleteData.location);
    // Convert numbers from string/number input
    formData.append('age', String(athleteData.age));
    formData.append('goalAmount', String(athleteData.goalAmount));
    // Handle optional fields
    if (athleteData.achievements) formData.append('achievements', athleteData.achievements); // Send as comma-separated
    formData.append('isActive', String(athleteData.isActive === undefined ? true : athleteData.isActive));
    formData.append('isFeatured', String(athleteData.isFeatured === undefined ? false : athleteData.isFeatured));
    // Append the image file
    formData.append('image', imageFile); // Field name should match backend Multer config

    try {
        console.log("Service: Admin creating athlete with FormData...");
        // ASSUMPTION: Endpoint is POST /api/admin/athletes
        const response = await api.post<Athlete>('/admin/athletes', formData);
        console.log("Service: Admin create athlete response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Admin Create Athlete Service Error:", error.response?.data || error.message);
         if (error.response) { console.error("Error Response Data:", error.response.data); }
        throw new Error(error.response?.data?.message || 'Error creating athlete');
    }
};

/**
 * Updates an existing athlete profile (Admin only).
 * Sends data as multipart/form-data if image is updated.
 * @param athleteId - The ID of the athlete to update.
 * @param athleteData - Fields to update.
 * @param imageFile - The new image File object (optional).
 */
export const updateAdminAthlete = async (athleteId: string, athleteData: Partial<AthleteFormData>, imageFile?: File | null): Promise<Athlete> => {
    if (!athleteId) throw new Error("Athlete ID is required for update.");

    const formData = new FormData();
     // Append only the fields that are actually present in the partial update data
    if (athleteData.name !== undefined) formData.append('name', athleteData.name);
    if (athleteData.age !== undefined) formData.append('age', String(athleteData.age));
    if (athleteData.sport !== undefined) formData.append('sport', athleteData.sport);
    if (athleteData.goalAmount !== undefined) formData.append('goalAmount', String(athleteData.goalAmount));
    if (athleteData.story !== undefined) formData.append('story', athleteData.story);
    if (athleteData.location !== undefined) formData.append('location', athleteData.location);
    if (athleteData.achievements !== undefined) formData.append('achievements', athleteData.achievements); // Send as comma-separated string
    if (athleteData.isActive !== undefined) formData.append('isActive', String(athleteData.isActive));
    if (athleteData.isFeatured !== undefined) formData.append('isFeatured', String(athleteData.isFeatured));

    // Append image ONLY if a new one is provided
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        console.log(`Service: Admin updating athlete ${athleteId} with FormData...`);
        // ASSUMPTION: Endpoint is PUT /api/admin/athletes/:id
        const response = await api.put<Athlete>(`/admin/athletes/${athleteId}`, formData);
        console.log("Service: Admin update athlete response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Admin Update Athlete Service Error (ID: ${athleteId}):`, error.response?.data || error.message);
        if (error.response) { console.error("Error Response Data:", error.response.data); }
        throw new Error(error.response?.data?.message || 'Error updating athlete');
    }
};

/**
 * Deletes an athlete profile (Admin only).
 * @param athleteId - The ID of the athlete to delete.
 */
export const deleteAdminAthlete = async (athleteId: string): Promise<{ message: string }> => {
    if (!athleteId) throw new Error("Athlete ID is required for deletion.");
    try {
        console.log(`Service: Admin deleting athlete ${athleteId}`);
        // ASSUMPTION: Endpoint is DELETE /api/admin/athletes/:id
        const response = await api.delete<{ message: string }>(`/admin/athletes/${athleteId}`);
        console.log("Service: Admin delete athlete response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Admin Delete Athlete Service Error (ID: ${athleteId}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error deleting athlete');
    }
};

// Add public getAthletes function if it doesn't exist elsewhere
/**
 * Fetches athletes for public view with filtering, searching, and pagination.
 */
interface AthletesApiResponse {
    athletes: Athlete[]; page: number; pages: number; count: number;
}
export const getAthletes = async (params = {}): Promise<AthletesApiResponse> => {
    try {
        console.log("Service: Getting public athletes with params:", params);
        const response = await api.get<AthletesApiResponse>('/athletes', { params });
        console.log("Service: Get public athletes response:", response.data);
        return response.data || { athletes: [], page: 1, pages: 1, count: 0 };
    } catch (error: any) {
        console.error("Get Public Athletes Service Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching athletes list');
    }
};

/**
 * Fetch details for a single athlete by ID (Public).
 */
export const getAthleteById = async (id: string): Promise<Athlete> => {
    if (!id) throw new Error("Athlete ID is required");
    try {
        console.log(`Service: Getting public athlete by ID: ${id}`);
        const response = await api.get<Athlete>(`/athletes/${id}`);
        console.log("Service: Get public athlete details response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Get Public Athlete By ID Service Error (ID: ${id}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching athlete details');
    }
};