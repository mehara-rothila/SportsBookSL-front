// src/services/trainerApplicationService.ts
import api from './api';

// Types
export interface TrainerApplication {
  _id: string;
  userId: string;
  name: string;
  specialization: string;
  sports: string; // Comma-separated on frontend
  location: string;
  hourlyRate: number;
  experienceYears: number;
  bio: string;
  languages?: string; // Comma-separated on frontend
  availability?: string; // Comma-separated on frontend
  certifications?: string; // Comma-separated on frontend
  status: 'pending' | 'approved' | 'rejected';
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

// Frontend interface for form data
export interface TrainerApplicationFormData {
  name: string;
  specialization: string;
  sports: string; // Comma-separated
  location: string;
  hourlyRate: number | string; // Allow string from form input
  experienceYears: number | string; // Allow string from form input
  bio: string;
  languages?: string; // Comma-separated
  availability?: string; // Comma-separated
  certifications?: string; // Comma-separated
}

export interface TrainerApplicationsResponse {
  applications: TrainerApplication[];
  total: number;
  page: number;
  pages: number;
}

// Submit a new trainer application
export const submitTrainerApplication = async (
  applicationData: TrainerApplicationFormData,
  profileImage?: File | null
): Promise<TrainerApplication> => {
  const formData = new FormData();
  
  // Add all text fields to FormData
  Object.entries(applicationData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  
  // Add profile image if provided
  if (profileImage) {
    formData.append('profileImage', profileImage);
  }

  try {
    console.log("Service: Submitting trainer application...");
    const response = await api.post<TrainerApplication>('/trainer-applications', formData);
    console.log("Service: Trainer application submitted:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Submit Trainer Application Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to submit trainer application');
  }
};

// Get user's trainer applications
export const getUserApplications = async (): Promise<TrainerApplication[]> => {
  try {
    console.log("Service: Getting user's trainer applications");
    const response = await api.get<{ applications: TrainerApplication[] }>('/trainer-applications/user');
    console.log("Service: User applications response:", response.data);
    return response.data.applications || [];
  } catch (error: any) {
    console.error("Get User Applications Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch your trainer applications');
  }
};

// ADMIN: Get all trainer applications
export const getAllApplications = async (
  page = 1,
  limit = 10,
  status?: 'pending' | 'approved' | 'rejected'
): Promise<TrainerApplicationsResponse> => {
  try {
    console.log("Service: Admin getting all trainer applications");
    const params: Record<string, any> = { page, limit };
    if (status) {
      params.status = status;
    }
    
    const response = await api.get<TrainerApplicationsResponse>('/admin/trainer-applications', { params });
    console.log("Service: Admin all applications response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Admin Get All Applications Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch trainer applications');
  }
};

// ADMIN: Get application details
export const getApplicationById = async (applicationId: string): Promise<TrainerApplication> => {
  try {
    console.log(`Service: Getting application ${applicationId}`);
    const response = await api.get<TrainerApplication>(`/admin/trainer-applications/${applicationId}`);
    console.log("Service: Application details response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Get Application By ID Error (${applicationId}):`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch application details');
  }
};

// ADMIN: Approve application
export const approveApplication = async (
  applicationId: string,
  notes?: string
): Promise<TrainerApplication> => {
  try {
    console.log(`Service: Approving application ${applicationId}`);
    const response = await api.put<TrainerApplication>(`/admin/trainer-applications/${applicationId}/approve`, {
      adminNotes: notes
    });
    console.log("Service: Approve application response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Approve Application Error (${applicationId}):`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to approve trainer application');
  }
};

// ADMIN: Reject application
export const rejectApplication = async (
  applicationId: string,
  reason: string
): Promise<TrainerApplication> => {
  try {
    console.log(`Service: Rejecting application ${applicationId}`);
    const response = await api.put<TrainerApplication>(`/admin/trainer-applications/${applicationId}/reject`, {
      adminNotes: reason
    });
    console.log("Service: Reject application response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Reject Application Error (${applicationId}):`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to reject trainer application');
  }
};