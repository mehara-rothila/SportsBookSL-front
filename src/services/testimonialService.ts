// src/services/testimonialService.ts
import api from './api';

// --- Interfaces ---
export interface Testimonial {
  _id: string;
  id?: string; // Can be included sometimes
  content: string;
  author: string;
  role?: string;
  imageUrl?: string; // Should be relative path like /uploads/testimonials/...
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestimonialFormData {
    content: string;
    author: string;
    role?: string;
    isActive?: boolean;
}

// --- Public Function (Existing) ---

/**
 * Fetch active testimonials.
 */
export const getActiveTestimonials = async (): Promise<Testimonial[]> => {
  try {
    console.log("Service: Getting active testimonials");
    const response = await api.get<Testimonial[]>('/testimonials');
    console.log("Service: Get testimonials response:", response.data);
    return response.data || [];
  } catch (error: any) {
    console.error("Get Testimonials Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching testimonials');
  }
};


// --- ADMIN FUNCTIONS ---

/**
 * Fetches all testimonials (including inactive) for the admin panel.
 * Requires admin authentication.
 */
export const getAllAdminTestimonials = async (): Promise<Testimonial[]> => {
    try {
        console.log("Service: Getting all admin testimonials");
        // **ASSUMPTION:** Backend endpoint is GET /api/admin/testimonials
        const response = await api.get<Testimonial[]>('/admin/testimonials');
        console.log("Service: Get all admin testimonials response count:", response.data?.length);
        return response.data || [];
    } catch (error: any) {
        console.error("Get All Admin Testimonials Service Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching testimonials for admin');
    }
};

/**
 * Creates a new testimonial (Admin only).
 * Sends data as multipart/form-data.
 * @param testimonialData - Text fields for the testimonial.
 * @param imageFile - The image File object (optional).
 */
export const createAdminTestimonial = async (testimonialData: TestimonialFormData, imageFile?: File | null): Promise<Testimonial> => {
    const formData = new FormData();
    formData.append('content', testimonialData.content);
    formData.append('author', testimonialData.author);
    if (testimonialData.role) formData.append('role', testimonialData.role);
    // Send isActive state ('true' or 'false')
    formData.append('isActive', String(testimonialData.isActive === undefined ? true : testimonialData.isActive));
    if (imageFile) {
        formData.append('imageUrl', imageFile); // Field name matching Multer config
    }

    try {
        console.log("Service: Admin creating testimonial with FormData...");
        // **ASSUMPTION:** Backend endpoint is POST /api/admin/testimonials
        const response = await api.post<Testimonial>('/admin/testimonials', formData);
        console.log("Service: Admin create testimonial response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Admin Create Testimonial Service Error:", error.response?.data || error.message);
         if (error.response) { console.error("Error Response Data:", error.response.data); }
        throw new Error(error.response?.data?.message || 'Error creating testimonial');
    }
};

/**
 * Updates an existing testimonial (Admin only).
 * Sends data as multipart/form-data if image is updated.
 * @param testimonialId - The ID of the testimonial to update.
 * @param testimonialData - Fields to update.
 * @param imageFile - The new image File object (optional).
 */
export const updateAdminTestimonial = async (testimonialId: string, testimonialData: Partial<TestimonialFormData>, imageFile?: File | null): Promise<Testimonial> => {
    if (!testimonialId) throw new Error("Testimonial ID is required for update.");

    const formData = new FormData();
    // Only append fields that are present in the update data
    if (testimonialData.content !== undefined) formData.append('content', testimonialData.content);
    if (testimonialData.author !== undefined) formData.append('author', testimonialData.author);
    if (testimonialData.role !== undefined) formData.append('role', testimonialData.role);
    if (testimonialData.isActive !== undefined) formData.append('isActive', String(testimonialData.isActive));

    // Only append image if a new one is selected
    if (imageFile) {
        formData.append('imageUrl', imageFile);
        formData.append('clearImage', 'false'); // Explicitly tell backend not to clear unless replacing
    }
     // Add a flag if you want an explicit way to *remove* the image without replacing
    // else if (/* some flag indicating removal */) {
    //    formData.append('clearImage', 'true');
    // }

    try {
        console.log(`Service: Admin updating testimonial ${testimonialId} with FormData...`);
        // **ASSUMPTION:** Backend endpoint is PUT /api/admin/testimonials/:id
        const response = await api.put<Testimonial>(`/admin/testimonials/${testimonialId}`, formData);
        console.log("Service: Admin update testimonial response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Admin Update Testimonial Service Error (ID: ${testimonialId}):`, error.response?.data || error.message);
         if (error.response) { console.error("Error Response Data:", error.response.data); }
        throw new Error(error.response?.data?.message || 'Error updating testimonial');
    }
};

/**
 * Deletes a testimonial (Admin only).
 * @param testimonialId - The ID of the testimonial to delete.
 */
export const deleteAdminTestimonial = async (testimonialId: string): Promise<{ message: string }> => {
    if (!testimonialId) throw new Error("Testimonial ID is required for deletion.");
    try {
        console.log(`Service: Admin deleting testimonial ${testimonialId}`);
        // **ASSUMPTION:** Backend endpoint is DELETE /api/admin/testimonials/:id
        const response = await api.delete<{ message: string }>(`/admin/testimonials/${testimonialId}`);
        console.log("Service: Admin delete testimonial response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Admin Delete Testimonial Service Error (ID: ${testimonialId}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error deleting testimonial');
    }
};