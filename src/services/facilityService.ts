// src/services/facilityService.ts
import api from './api';

// --- Interfaces ---

// Interface for public facility list item
interface FacilityListItemPublic {
    _id: string;
    name: string;
    location: string;
    sportTypes: string[];
    images: string[]; // Expecting array from backend
    rating?: number;
    reviewCount?: number;
    pricePerHour?: string;
    isPremium?: boolean;
    isNew?: boolean;
    pricePerHourValue?: number;
    address: string; // <-- FIX APPLIED HERE (Required)
}

// Interface for public facility list API response
interface FacilitiesApiResponsePublic {
    facilities: FacilityListItemPublic[];
    page: number;
    pages: number;
    count: number;
}

// Interface for single facility details (used also as return type for create/update)
// Exporting for use in modal/page
export interface FacilityDetails extends FacilityListItemPublic {
    description: string; // <-- FIX APPLIED HERE (Required)
    longDescription?: string;
    amenities?: string[];
    pricePerDay?: number;
    contactInfo?: { phone?: string; email?: string; website?: string; };
    operatingHours?: { day: string; open: string; close: string; }[];
    equipmentForRent?: { name: string; pricePerHour: number; available: number; }[];
    associatedCoaches?: { _id: string; name: string; specialization: string; profileImage?: string; rating?: number; hourlyRate?: number; }[];
    mapLocation?: { lat?: number; lng?: number; };
    isFeatured?: boolean;
    reviews?: any[]; // Define Review interface later if needed
    isActive?: boolean; // Include isActive
    createdAt?: string;
    updatedAt?: string;
}

// Interface for availability data
interface TimeSlot { time: string; available: boolean; }
interface AvailabilityData { date: string; slots: TimeSlot[]; }

// Interface for reviews data
interface Review { /* Define Review structure if needed */ }
interface ReviewsResponse { reviews: Review[]; page: number; pages: number; count: number; }


// Interface for Admin Facility List Item
interface AdminFacilityListItem {
    _id: string;
    name: string;
    location: string;
    sportTypes: string[];
    pricePerHour?: string;
    rating?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    images?: string[];
    createdAt?: string;
}

// Interface for Admin Facility List API Response
interface AdminFacilitiesApiResponse {
    facilities: AdminFacilityListItem[];
    // Add pagination later if needed
}

// Interface for Create/Update Facility Form Data (Text Fields)
// Exporting for use in modals
export interface FacilityFormData {
    name: string;
    location: string;
    address: string;
    description: string;
    longDescription?: string;
    sportTypes: string; // Expecting comma-separated string based on controller parsing
    amenities?: string; // Expecting comma-separated string
    pricePerHour: string; // Display string
    pricePerHourValue: number; // Numeric value
    pricePerDay?: number | string; // Allow empty string from form
    contactPhone?: string;
    contactEmail?: string;
    contactWebsite?: string;
    mapLat?: number | string; // Allow empty string from form
    mapLng?: number | string; // Allow empty string from form
    isNew?: boolean;
    isPremium?: boolean;
    isFeatured?: boolean;
    isActive?: boolean; // Added isActive for admin editing
    // Complex fields like operatingHours, equipmentForRent omitted for simplicity here
}


// --- Public Service Functions ---

/**
 * Fetch facilities with filtering, searching, and pagination.
 */
export const getFacilities = async (params = {}): Promise<FacilitiesApiResponsePublic> => {
    try {
        console.log("Service: Getting facilities with params:", params);
        const response = await api.get<FacilitiesApiResponsePublic>('/facilities', { params });
        console.log("Service: Get facilities response:", response.data);
        return response.data || { facilities: [], page: 1, pages: 1, count: 0 };
    } catch (error: any) {
        console.error("Get Facilities Service Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching facilities list');
    }
};

/**
 * Fetch featured facilities.
 */
export const getFeaturedFacilities = async (limit = 4): Promise<FacilityListItemPublic[]> => {
     try {
        console.log(`Service: Getting featured facilities (limit: ${limit})`);
        const response = await api.get<FacilityListItemPublic[]>('/facilities/featured', { params: { limit } });
        console.log("Service: Get featured facilities response:", response.data);
        return response.data || [];
    } catch (error: any) {
        console.error("Get Featured Facilities Service Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching featured facilities');
    }
};

/**
 * Fetch details for a single facility by ID.
 */
export const getFacilityById = async (id: string): Promise<FacilityDetails> => {
    if (!id) throw new Error("Facility ID is required");
    try {
        console.log(`Service: Getting facility by ID: ${id}`);
        const response = await api.get<FacilityDetails>(`/facilities/${id}`);
        console.log("Service: Get facility details response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Get Facility By ID Service Error (ID: ${id}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching facility details');
    }
};

/**
 * Fetch availability for a facility.
 */
export const getFacilityAvailability = async (id: string, month?: string): Promise<AvailabilityData[]> => {
     if (!id) throw new Error("Facility ID is required");
     try {
        console.log(`Service: Getting availability for facility ID: ${id}, Month: ${month}`);
        const params = month ? { month } : {};
        const response = await api.get<AvailabilityData[]>(`/facilities/${id}/availability`, { params });
        console.log("Service: Get facility availability response:", response.data);
        return response.data || [];
     } catch (error: any) {
        console.error(`Get Facility Availability Service Error (ID: ${id}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching facility availability');
     }
};

/**
 * Fetch reviews for a facility.
 */
export const getFacilityReviews = async (id: string, page = 1, limit = 5): Promise<ReviewsResponse> => {
     if (!id) throw new Error("Facility ID is required");
     try {
        console.log(`Service: Getting reviews for facility ID: ${id}, Page: ${page}`);
        const response = await api.get<ReviewsResponse>(`/facilities/${id}/reviews`, { params: { pageNumber: page, limit } });
        console.log("Service: Get facility reviews response:", response.data);
        return response.data || { reviews: [], page: 1, pages: 1, count: 0 };
     } catch (error: any) {
        console.error(`Get Facility Reviews Service Error (ID: ${id}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching facility reviews');
     }
};

// --- ADMIN Service Functions ---

/**
 * Fetches all facilities for the admin panel.
 * Requires admin authentication token.
 */
export const getAllAdminFacilities = async (): Promise<AdminFacilitiesApiResponse> => {
  try {
    console.log("Service: Getting all facilities for admin");
    // Backend route: GET /api/admin/facilities
    const response = await api.get<AdminFacilitiesApiResponse>('/admin/facilities');
    console.log("Service: Get all admin facilities response:", response.data);
    return response.data || { facilities: [] }; // Ensure facilities array exists
  } catch (error: any) {
    console.error("Get All Admin Facilities Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching facilities list for admin');
  }
};

/**
 * Creates a new facility (Admin only).
 * Sends data as multipart/form-data.
 * @param facilityData - The text field data for the facility.
 * @param imageFiles - An array of File objects for the facility images.
 */
export const createFacility = async (facilityData: FacilityFormData, imageFiles: File[]): Promise<FacilityDetails> => {
    if (!imageFiles || imageFiles.length === 0) { throw new Error("At least one facility image is required."); }
    const formData = new FormData();
    Object.entries(facilityData).forEach(([key, value]) => { if (value !== undefined && value !== null) { formData.append(key, String(value)); } });
    imageFiles.forEach((file) => { formData.append('images', file, file.name); });
    try {
        console.log("Service: Creating facility with FormData...");
        // POST request to /api/facilities (ensure backend route is correct and protected)
        const response = await api.post<FacilityDetails>('/facilities', formData);
        console.log("Service: Create facility response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Create Facility Service Error:", error.response?.data || error.message);
        if (error.response) { console.error("Error Response Data:", error.response.data); }
        throw new Error(error.response?.data?.message || 'Error creating facility');
    }
};

/**
 * Deletes a facility (Admin only).
 * Requires admin authentication token.
 * @param facilityId - The ID of the facility to delete.
 */
export const deleteFacilityByAdmin = async (facilityId: string): Promise<{ message: string }> => {
    if (!facilityId) throw new Error("Facility ID is required for deletion.");
    try {
        console.log(`Service: Admin deleting facility ${facilityId}`);
        // Backend route: DELETE /api/admin/facilities/:id
        const response = await api.delete<{ message: string }>(`/admin/facilities/${facilityId}`);
        console.log("Service: Admin delete facility response:", response.data);
        return response.data; // Return success message
    } catch (error: any) {
        console.error(`Admin Delete Facility Service Error (ID: ${facilityId}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error deleting facility');
    }
};

/**
 * Fetches full details for a single facility (Admin only - for editing).
 * Requires admin authentication token.
 * @param facilityId - The ID of the facility to fetch.
 */
export const getAdminFacilityById = async (facilityId: string): Promise<FacilityDetails> => {
    if (!facilityId) throw new Error("Facility ID is required");
    try {
        console.log(`Service: Admin getting facility by ID: ${facilityId}`);
        // Backend route: GET /api/admin/facilities/:id
        const response = await api.get<FacilityDetails>(`/admin/facilities/${facilityId}`);
        console.log("Service: Admin get facility details response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Admin Get Facility By ID Service Error (ID: ${facilityId}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching facility details for admin');
    }
};


/**
 * Updates an existing facility (Admin only).
 * Sends data as multipart/form-data if new images are provided.
 * @param facilityId - The ID of the facility to update.
 * @param facilityData - An object containing the text fields to update.
 * @param imageFiles - An array of NEW image File objects (optional). Send empty array or null if not changing images.
 * @param clearImages - Boolean flag to indicate if existing images should be removed before adding new ones (or if just removing all).
 */
// src/services/facilityService.ts - updateFacilityByAdmin function
export const updateFacilityByAdmin = async (
  facilityId: string,
  facilityData: Partial<FacilityFormData>,
  imageFiles?: File[] | null,
  clearImages: boolean = false
): Promise<FacilityDetails> => {
  if (!facilityId) throw new Error("Facility ID is required for update.");

  const formData = new FormData();

  // Add flag to preserve associatedCoaches field - ADD THIS FIRST
  formData.append('preserveAssociatedCoaches', 'true');

  // Append text fields that are present in facilityData
  Object.entries(facilityData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
          if (typeof value === 'boolean') {
              formData.append(key, String(value));
          } else {
              formData.append(key, String(value));
          }
      }
      else if (value === '') {
          formData.append(key, '');
      }
  });

  // Indicate if existing images should be cleared
  if (clearImages) {
      formData.append('clearImages', 'true');
  }

  // Append NEW image files if provided
  if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
          formData.append('images', file, file.name);
      });
  }

  // Debug FormData contents
  console.log("FormData contents before sending:");
  for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value instanceof File ? `File: ${value.name}` : value}`);
  }

  try {
      console.log(`Service: Admin updating facility ${facilityId} with FormData...`);
      const response = await api.put<FacilityDetails>(`/admin/facilities/${facilityId}`, formData);
      console.log("Service: Admin update facility response:", response.data);
      return response.data;
  } catch (error: any) {
      console.error(`Admin Update Facility Service Error (ID: ${facilityId}):`, error.response?.data || error.message);
      if (error.response) { console.error("Error Response Data:", error.response.data); }
      throw new Error(error.response?.data?.message || 'Error updating facility');
  }
};