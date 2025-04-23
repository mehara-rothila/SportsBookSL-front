// src/services/categoryService.ts
import api from './api';

// --- Interfaces ---
export interface Category {
    _id: string;
    name: string;
    description: string;
    imageSrc: string; // Relative path like /uploads/categories/...
    iconSvg?: string;
    slug: string;
    createdAt?: string;
    updatedAt?: string;
}

// Interface for the data needed to create/update a category
// Note: imageSrc is handled via FormData, not directly in JSON data
export interface CategoryFormData {
    name: string;
    description: string;
    slug: string;
    iconSvg?: string;
    // imageSrcFile?: File | null; // Handled separately in FormData
}

// --- Service Functions ---

/**
 * Fetches all categories.
 */
export const getCategories = async (): Promise<Category[]> => {
    try {
        console.log("Service: Getting all categories");
        const response = await api.get<Category[]>('/categories');
        console.log("Service: Get categories response count:", response.data?.length);
        return response.data || [];
    } catch (error: any) {
        console.error("Get Categories Service Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching categories');
    }
};

/**
 * Fetches a single category by its ID or slug.
 */
export const getCategoryByIdOrSlug = async (idOrSlug: string): Promise<Category> => {
    if (!idOrSlug) throw new Error("Category ID or Slug is required");
    try {
        console.log(`Service: Getting category by ID/Slug: ${idOrSlug}`);
        const response = await api.get<Category>(`/categories/${idOrSlug}`);
        console.log("Service: Get category response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Get Category Service Error (ID/Slug: ${idOrSlug}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error fetching category details');
    }
};

/**
 * Creates a new category (Admin only).
 * Sends data as multipart/form-data due to image upload.
 * @param categoryData - Text fields for the category (name, slug, description, iconSvg).
 * @param imageFile - The image File object for the category.
 */
export const createCategory = async (categoryData: CategoryFormData, imageFile: File): Promise<Category> => {
    if (!imageFile) throw new Error("Category image file is required.");

    const formData = new FormData();
    formData.append('name', categoryData.name);
    formData.append('description', categoryData.description);
    formData.append('slug', categoryData.slug);
    if (categoryData.iconSvg) {
        formData.append('iconSvg', categoryData.iconSvg);
    }
    formData.append('imageSrc', imageFile); // Use 'imageSrc' as the field name for Multer

    try {
        console.log("Service: Creating category with FormData...");
        // Token attached by interceptor
        // Content-Type set automatically by browser for FormData
        const response = await api.post<Category>('/categories', formData);
        console.log("Service: Create category response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Create Category Service Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error creating category');
    }
};

/**
 * Updates an existing category (Admin only).
 * Sends data as multipart/form-data if a new image is provided.
 * @param categoryId - The ID of the category to update.
 * @param categoryData - Text fields to update.
 * @param imageFile - The new image File object (optional).
 */
export const updateCategory = async (categoryId: string, categoryData: Partial<CategoryFormData>, imageFile?: File | null): Promise<Category> => {
    if (!categoryId) throw new Error("Category ID is required for update.");

    const formData = new FormData();
    // Append text fields only if they exist in categoryData
    if (categoryData.name !== undefined) formData.append('name', categoryData.name);
    if (categoryData.description !== undefined) formData.append('description', categoryData.description);
    if (categoryData.slug !== undefined) formData.append('slug', categoryData.slug);
    if (categoryData.iconSvg !== undefined) formData.append('iconSvg', categoryData.iconSvg); // Allow sending empty string to clear

    // Append image only if a new one is provided
    if (imageFile) {
        formData.append('imageSrc', imageFile); // Use 'imageSrc' for Multer
    }

    try {
        console.log(`Service: Updating category ${categoryId} with FormData...`);
        const response = await api.put<Category>(`/categories/${categoryId}`, formData);
        console.log("Service: Update category response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Update Category Service Error (ID: ${categoryId}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error updating category');
    }
};

/**
 * Deletes a category (Admin only).
 * @param categoryId - The ID of the category to delete.
 */
export const deleteCategory = async (categoryId: string): Promise<{ message: string }> => {
    if (!categoryId) throw new Error("Category ID is required for deletion.");
    try {
        console.log(`Service: Deleting category ${categoryId}`);
        const response = await api.delete<{ message: string }>(`/categories/${categoryId}`);
        console.log("Service: Delete category response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Delete Category Service Error (ID: ${categoryId}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error deleting category');
    }
};