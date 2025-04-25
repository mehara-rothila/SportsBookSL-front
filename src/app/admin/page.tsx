'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, isAuthenticated } from '@/services/authService';
import {
  UsersIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  GiftIcon,
  // StarIcon, // Keep StarIcon if used elsewhere, otherwise can be removed
  LifebuoyIcon,
  ClipboardDocumentCheckIcon,
  // NewspaperIcon, // Keep NewspaperIcon if used elsewhere, otherwise can be removed
  ArrowTrendingUpIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

// Import services for fetching real-time data
import * as userService from '@/services/userService';
import * as facilityService from '@/services/facilityService';
import * as bookingService from '@/services/bookingService';
import * as donationService from '@/services/donationService';
import * as trainerApplicationService from '@/services/trainerApplicationService';
import * as financialAidService from '@/services/financialAidService';
import * as athleteService from '@/services/athleteService';
import * as testimonialService from '@/services/testimonialService';

// Define a minimal type for AdminBookingListItem for the purpose of the reduce function
// Ideally, you would import the actual type if it's defined elsewhere
interface AdminBookingListItem {
  _id: string;
  user: { name: string } | string; // Example structure, adjust as needed
  facility?: { name: string } | string; // Example structure, adjust as needed
  trainer?: { name: string } | string; // Example structure, adjust as needed
  date: string;
  status: 'upcoming' | 'completed' | 'cancelled' | string;
  totalCost?: number;
}

// Define types for the data returned by services (optional but good practice)
interface UsersData { users: any[] }
interface FacilitiesData { facilities: any[] }
interface BookingsData { bookings: AdminBookingListItem[]; count: number }
interface DonationsData { donations: any[]; count: number }
interface ApplicationsData { applications: any[]; total: number }
interface AthletesData extends Array<any> {}
interface TestimonialsData extends Array<any> {}
interface FinancialAidData { applications: any[]; count: number }

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // State for dashboard stats
  const [userCount, setUserCount] = useState(0);
  const [facilityCount, setFacilityCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [donationCount, setDonationCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [athleteCount, setAthleteCount] = useState(0);
  const [testimonialCount, setTestimonialCount] = useState(0);
  const [pendingFinancialAidCount, setPendingFinancialAidCount] = useState(0);

  // State for recent data
  const [recentBookings, setRecentBookings] = useState<AdminBookingListItem[]>([]);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);

  useEffect(() => {
    // Check authentication and admin status
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const isAuth = isAuthenticated();

        if (!isAuth) {
          router.push('/login?redirect=/admin');
          return;
        }

        const currentUser = getCurrentUser();
        setUser(currentUser);

        if (currentUser?.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          setIsLoading(false);
          return;
        }

        // Fetch real data for the dashboard
        await fetchDashboardData();

      } catch (err) {
        console.error('Authentication check failed:', err);
        setError('Authentication error. Please log in again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Function to fetch all dashboard data in parallel
  const fetchDashboardData = async () => {
    try {
      // Fetch data in parallel using Promise.all
      const [
        usersData,
        facilitiesData,
        bookingsData,
        donationsData,
        applicationsData,
        athletesData,
        testimonialsData,
        financialAidData
      ] = await Promise.all([
        userService.getAllAdminUsers().catch(err => { console.error('Failed to fetch users:', err); return { users: [] }; }) as Promise<UsersData>,
        facilityService.getAllAdminFacilities().catch(err => { console.error('Failed to fetch facilities:', err); return { facilities: [] }; }) as Promise<FacilitiesData>,
        bookingService.getAllAdminBookings().catch(err => { console.error('Failed to fetch bookings:', err); return { bookings: [], count: 0 }; }) as Promise<BookingsData>,
        donationService.getAllAdminDonations().catch(err => { console.error('Failed to fetch donations:', err); return { donations: [], count: 0 }; }) as Promise<DonationsData>,
        trainerApplicationService.getAllApplications(1, 100, 'pending').catch(err => { console.error('Failed to fetch applications:', err); return { applications: [], total: 0 }; }) as Promise<ApplicationsData>,
        athleteService.getAllAdminAthletes().catch(err => { console.error('Failed to fetch athletes:', err); return []; }) as Promise<AthletesData>,
        testimonialService.getAllAdminTestimonials().catch(err => { console.error('Failed to fetch testimonials:', err); return []; }) as Promise<TestimonialsData>,
        financialAidService.getAllAdminApplications({ status: 'pending' }).catch(err => { console.error('Failed to fetch financial aid:', err); return { applications: [], count: 0 }; }) as Promise<FinancialAidData>
      ]);

      // Update state with fetched data
      setUserCount(usersData.users.length);
      setFacilityCount(facilitiesData.facilities.length);
      setBookingCount(bookingsData.count);
      setDonationCount(donationsData.count);
      setPendingApplications(applicationsData.total);
      setAthleteCount(athletesData.length);
      setTestimonialCount(testimonialsData.length);
      setPendingFinancialAidCount(financialAidData.count);

      // Calculate total revenue from bookings
      // FIX: Explicitly type the 'total' accumulator as number
      const revenue = bookingsData.bookings.reduce((total: number, booking) => total + (booking.totalCost || 0), 0);
      setTotalRevenue(revenue);

      // Set recent bookings (limit to 4)
      setRecentBookings(bookingsData.bookings.slice(0, 4));

      // Set recent donations (limit to 3)
      setRecentDonations(donationsData.donations.slice(0, 3));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-xl p-8 border border-emerald-500/20">
            <div className="flex justify-center">
              <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-center text-white mt-4">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || user?.role !== 'admin') {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-xl p-8 border border-emerald-500/20">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
              <div className="bg-red-500/20 text-red-100 p-4 rounded-lg mb-6">
                {error || "You don't have permission to access the admin panel."}
              </div>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-12"> {/* Added pb-12 for bottom padding */}
      {/* Welcome Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-gradient-to-r from-emerald-800/80 to-emerald-600/80 backdrop-blur-md shadow-xl rounded-xl p-6 border border-emerald-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome back, {user?.name}</h1>
              <p className="text-emerald-100">Here's what's happening with your sports platform today</p>
            </div>
            <div className="mt-4 md:mt-0">
              {/* Add Export Data functionality if needed */}
              {/* <button className="px-4 py-2 bg-white text-emerald-700 rounded-lg shadow-sm hover:bg-emerald-50 transition-colors text-sm font-medium">
                Export Data
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* User Card */}
          <div className="bg-white/10 backdrop-blur-md shadow-md rounded-xl p-4 border border-emerald-500/20 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Users</p>
                <h3 className="text-white text-xl font-bold mt-1">{userCount}</h3>
                <p className="text-emerald-300 text-xs mt-1">Active Accounts</p>
              </div>
              <div className="bg-emerald-600/30 p-2 rounded-lg">
                <UsersIcon className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>
          {/* Facility Card */}
          <div className="bg-white/10 backdrop-blur-md shadow-md rounded-xl p-4 border border-emerald-500/20 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Facilities</p>
                <h3 className="text-white text-xl font-bold mt-1">{facilityCount}</h3>
                <p className="text-emerald-300 text-xs mt-1">Total Available</p>
              </div>
              <div className="bg-emerald-600/30 p-2 rounded-lg">
                <BuildingOfficeIcon className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>
          {/* Booking Card */}
          <div className="bg-white/10 backdrop-blur-md shadow-md rounded-xl p-4 border border-emerald-500/20 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Active Bookings</p>
                <h3 className="text-white text-xl font-bold mt-1">{bookingCount}</h3>
                <p className="text-emerald-300 text-xs mt-1">Total Reservations</p>
              </div>
              <div className="bg-emerald-600/30 p-2 rounded-lg">
                <CalendarDaysIcon className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>
          {/* Revenue Card */}
          <div className="bg-white/10 backdrop-blur-md shadow-md rounded-xl p-4 border border-emerald-500/20 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Revenue</p>
                <h3 className="text-white text-xl font-bold mt-1">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3> {/* Format currency */}
                <p className="text-emerald-300 text-xs mt-1">From all bookings</p>
              </div>
              <div className="bg-emerald-600/30 p-2 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Recent Bookings */}
            <div className="bg-white/10 backdrop-blur-md shadow-md rounded-xl p-6 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Bookings</h2>
                <Link href="/admin/bookings" className="text-emerald-300 text-sm hover:text-emerald-100 transition-colors">
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-emerald-500/20">
                      <th className="text-left pr-4 py-3 text-emerald-100 text-xs uppercase font-semibold tracking-wider">User</th>
                      <th className="text-left px-4 py-3 text-emerald-100 text-xs uppercase font-semibold tracking-wider">Facility/Trainer</th>
                      <th className="text-left px-4 py-3 text-emerald-100 text-xs uppercase font-semibold tracking-wider">Date</th>
                      <th className="text-left pl-4 py-3 text-emerald-100 text-xs uppercase font-semibold tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking, index) => (
                        <tr key={booking._id} className={`hover:bg-emerald-500/10 ${index < recentBookings.length - 1 ? "border-b border-emerald-500/10" : ""}`}>
                          <td className="pr-4 py-3 text-white text-sm">
                            {/* Handle cases where user might be an ID or object */}
                            {typeof booking.user === 'object' && booking.user?.name ? booking.user.name : typeof booking.user === 'string' ? 'User ID' : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-white text-sm">
                            {/* Handle cases where facility/trainer might be an ID or object */}
                            {(typeof booking.facility === 'object' && booking.facility?.name)
                              ? booking.facility.name
                              : (typeof booking.trainer === 'object' && booking.trainer?.name)
                                ? booking.trainer.name
                                : (typeof booking.facility === 'string' || typeof booking.trainer === 'string')
                                  ? 'Item ID'
                                  : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-emerald-100 text-sm">
                            {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="pl-4 py-3">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              booking.status === 'upcoming'
                                ? 'bg-emerald-600/30 text-emerald-300'
                                : booking.status === 'completed'
                                  ? 'bg-purple-600/30 text-purple-300'
                                  : booking.status === 'cancelled'
                                    ? 'bg-red-600/30 text-red-300'
                                    : 'bg-gray-600/30 text-gray-300'
                            }`}>
                              {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-emerald-100 text-sm">No recent bookings found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Recent Donations */}
            <div className="bg-white/10 backdrop-blur-md shadow-md rounded-xl p-6 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Recent Donations</h2>
                <Link href="/admin/donations" className="text-emerald-300 text-sm hover:text-emerald-100 transition-colors">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentDonations.length > 0 ? (
                  recentDonations.map((donation) => (
                    <div key={donation._id} className="flex items-center justify-between p-2 rounded-md hover:bg-emerald-500/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600/30 flex items-center justify-center flex-shrink-0">
                          <GiftIcon className="h-5 w-5 text-emerald-300" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {/* Adjust based on actual donation object structure */}
                            {donation.isAnonymous ? 'Anonymous' : (donation.donorUser?.name || donation.donorName || 'Donor')}
                          </p>
                          <p className="text-emerald-100 text-xs">
                            {/* Adjust based on actual donation object structure */}
                            For: {donation.athlete?.name || donation.campaign?.name || 'General Support'}
                          </p>
                        </div>
                      </div>
                      <p className="text-emerald-300 font-semibold text-sm whitespace-nowrap pl-2">
                        ${donation.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-emerald-100 text-sm py-4">No recent donations found</p>
                )}
              </div>
            </div>

            {/* Items Requiring Attention */}
            <div className="bg-white/10 backdrop-blur-md shadow-md rounded-xl p-6 border border-emerald-500/20">
              <div className="flex items-center space-x-2 mb-4">
                <BellAlertIcon className="h-5 w-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">Requires Attention</h2>
              </div>
              <div className="space-y-3">
                {/* Trainer Applications */}
                <Link href="/admin/trainer-applications" className="block p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ClipboardDocumentCheckIcon className="h-5 w-5 text-amber-400" />
                      <p className="text-white text-sm font-medium">Trainer Applications</p>
                    </div>
                    <span className="bg-amber-500/30 text-amber-200 text-xs font-semibold rounded-full px-2 py-1">
                      {pendingApplications}
                    </span>
                  </div>
                </Link>

                {/* Financial Aid Requests */}
                <Link href="/admin/financial-aid" className="block p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <LifebuoyIcon className="h-5 w-5 text-amber-400" />
                      <p className="text-white text-sm font-medium">Financial Aid Requests</p>
                    </div>
                    <span className="bg-amber-500/30 text-amber-200 text-xs font-semibold rounded-full px-2 py-1">
                      {pendingFinancialAidCount}
                    </span>
                  </div>
                </Link>

                 {/* Athlete Count (Maybe not requiring 'attention', but fits here) */}
                 <Link href="/admin/athletes" className="block p-3 bg-sky-500/10 rounded-lg border border-sky-500/20 hover:bg-sky-500/20 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                        <UserGroupIcon className="h-5 w-5 text-sky-400" />
                        <p className="text-white text-sm font-medium">Registered Athletes</p>
                        </div>
                        <span className="bg-sky-500/30 text-sky-200 text-xs font-semibold rounded-full px-2 py-1">
                        {athleteCount}
                        </span>
                    </div>
                </Link>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white/10 backdrop-blur-md shadow-md rounded-xl p-6 border border-emerald-500/20">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/facilities/new" className="flex items-center justify-center py-2 px-3 bg-emerald-600/40 hover:bg-emerald-600/60 text-white text-sm font-medium rounded-lg transition-colors text-center">
                  Add Facility
                </Link>
                <Link href="/admin/trainers/new" className="flex items-center justify-center py-2 px-3 bg-emerald-600/40 hover:bg-emerald-600/60 text-white text-sm font-medium rounded-lg transition-colors text-center">
                  Add Trainer
                </Link>
                <Link href="/admin/categories" className="flex items-center justify-center py-2 px-3 bg-emerald-600/40 hover:bg-emerald-600/60 text-white text-sm font-medium rounded-lg transition-colors text-center">
                  Categories
                </Link>
                <Link href="/admin/testimonials" className="flex items-center justify-center py-2 px-3 bg-emerald-600/40 hover:bg-emerald-600/60 text-white text-sm font-medium rounded-lg transition-colors text-center">
                  Testimonials
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}