// src/services/financialAidService.ts
import api from './api';

// Define interfaces for your financial aid application data
export interface FinancialAidApplicationSummary {
  _id: string;
  submittedDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_info';
  sportsInfo?: { primarySport?: string };
  // Add other summary fields as needed from the backend response
}

// Assuming the backend might return the full application details on successful submission
export interface FinancialAidApplicationDetails {
  _id: string;
  applicantUser: string; // Or populated User object
  personalInfoSnapshot?: {
    fullName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string; // Date string
    address?: string;
    city?: string;
    postalCode?: string;
  };
  sportsInfo?: {
    primarySport?: string;
    skillLevel?: string;
    yearsExperience?: number;
    currentAffiliation?: string;
    achievements?: string;
  };
  financialNeed?: {
    description?: string;
    requestedAmount?: number;
    facilitiesNeeded?: string[];
    monthlyUsage?: string;
  };
  reference?: {
    name?: string;
    relationship?: string;
    contactInfo?: string;
    organizationName?: string;
  };
  documentUrls?: string[];
  supportingInfo?: {
    previousAid?: string;
    otherPrograms?: string;
    additionalInfo?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'needs_info';
  submittedDate?: string; // Date string
  reviewedDate?: string; // Date string
  approvedAmount?: number;
  validUntil?: string; // Date string
  adminNotes?: string;
  createdAt?: string; // Date string
  updatedAt?: string; // Date string
}

// Interface for admin applications list response
interface ApplicationsListResponse {
  applications: FinancialAidApplicationSummary[]; // Use summary for lists
  page: number;
  pages: number;
  count: number;
}

// --- USER FUNCTIONS ---

/**
 * Function to submit a new financial aid application using FormData.
 * IMPORTANT: The `applicationData` parameter should be a FormData object.
 */
export const submitFinancialAidApplication = async (
  applicationFormData: FormData // Expect FormData
): Promise<{ message: string; applicationId: string }> => {
  try {
    console.log('Service: Submitting financial aid application FormData...');
    // Make sure the endpoint matches your backend route
    const response = await api.post<{ message: string; applicationId: string }>(
      '/financial-aid/apply',
      applicationFormData
      // Axios handles Content-Type for FormData automatically
    );
    console.log('Service: Submit financial aid application response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Submit Financial Aid Application Service Error:', error.response?.data || error.message, error);
    throw new Error(error.response?.data?.message || 'Failed to submit application');
  }
};

/**
 * Function to get the current user's submitted applications.
 */
export const getUserApplications = async (): Promise<FinancialAidApplicationSummary[]> => {
  try {
    console.log('Service: Getting user financial aid applications...');
    // Make sure the endpoint matches your backend route
    const response = await api.get<FinancialAidApplicationSummary[]>(
      '/financial-aid/my-applications'
    );
    console.log('Service: Get user financial aid applications response:', response.data);
    return response.data || [];
  } catch (error: any) {
    console.error('Get User Applications Service Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch user applications');
  }
};


// --- ADMIN FUNCTIONS ---

/**
 * Fetch all financial aid applications (Admin only).
 * @param params - Optional query parameters (e.g., { page: 1, limit: 10, status: 'pending' })
 */
export const getAllAdminApplications = async (params = {}): Promise<ApplicationsListResponse> => {
  try {
    console.log("Service: Getting all financial aid applications for admin with params:", params);
    const response = await api.get<ApplicationsListResponse>('/admin/financial-aid', { params });
    console.log("Service: Get all admin financial aid applications response:", response.data);
    return response.data || { applications: [], page: 1, pages: 1, count: 0 };
  } catch (error: any) {
    console.error("Get All Admin Financial Aid Applications Service Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching financial aid applications list');
  }
};

/**
 * Fetch a specific financial aid application by ID (Admin only).
 */
export const getAdminApplicationById = async (applicationId: string): Promise<FinancialAidApplicationDetails> => {
  if (!applicationId) throw new Error("Application ID is required");
  try {
    console.log(`Service: Admin getting financial aid application by ID: ${applicationId}`);
    const response = await api.get<FinancialAidApplicationDetails>(`/admin/financial-aid/${applicationId}`);
    console.log("Service: Admin get financial aid application details response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Admin Get Financial Aid Application Service Error (ID: ${applicationId}):`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching financial aid application details');
  }
};

/**
 * Update the status and details of a financial aid application (Admin only).
 */
export const updateAdminApplicationStatus = async (
  applicationId: string,
  updateData: {
    status: FinancialAidApplicationSummary['status'];
    adminNotes?: string;
    approvedAmount?: number;
    validUntil?: string; // Expecting ISO date string or YYYY-MM-DD
  }
): Promise<FinancialAidApplicationDetails> => {
  if (!applicationId) throw new Error("Application ID is required");
  if (!updateData.status) throw new Error("Status is required");

  // Clean up data: remove approvedAmount/validUntil if status is not 'approved'
  if (updateData.status !== 'approved') {
    delete updateData.approvedAmount;
    delete updateData.validUntil;
  }

  try {
    console.log(`Service: Admin updating financial aid application ${applicationId} with data:`, updateData);
    // Use the dedicated admin endpoint
    const response = await api.put<FinancialAidApplicationDetails>(
      `/admin/financial-aid/${applicationId}`, // Matches the admin route
      updateData
      // Content-Type 'application/json' is default for api instance
    );
    console.log("Service: Admin update financial aid application status response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Admin Update Financial Aid Application Status Service Error (ID: ${applicationId}):`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error updating financial aid application status');
  }
};

// Note: Functions like update, cancel, upload documents by the *user* after submission
// would need corresponding backend routes and controllers if required.

// Export functions individually
export default {
  submitFinancialAidApplication,
  getUserApplications,
  getAllAdminApplications,
  getAdminApplicationById,
  updateAdminApplicationStatus
};
