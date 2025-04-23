// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect, Fragment, useCallback } from 'react';
import * as userService from '@/services/userService';
import Link from 'next/link';
import EditUserModal from '@/components/admin/EditUserModal';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';

// --- Interfaces ---
interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'trainer' | 'facilityOwner';
    createdAt: string;
    phone?: string;
    address?: string;
    avatar?: string;
}

// --- Constants ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_AVATAR = '/images/default-avatar.png';

// --- Helper Components ---
const LoadingIndicator = () => (
  <div className="text-center py-16">
    <div className="inline-block w-12 h-12 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
    <p className="text-white/80 font-medium">Loading users...</p>
  </div>
);

const ErrorDisplay = ({ message }: { message: string | null }) => (
  <div className="text-center py-12 px-4 bg-red-900/20 backdrop-blur-sm text-red-100 rounded-lg border border-red-500/30 shadow-inner">
    <p className="font-bold text-lg mb-2">Oops! Error Loading Data.</p>
    <p className="mb-4">{message || 'An unknown error occurred'}</p>
  </div>
);

const NoUsersRow = () => (
  <tr>
    <td colSpan={5} className="text-center py-10 px-4">
      <div className="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-300/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <p className="text-emerald-100/70 text-lg font-medium mb-1">No users found</p>
        <p className="text-white/50 text-sm">Add users to see them listed here</p>
      </div>
    </td>
  </tr>
);


export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);


    // --- Fetch Users ---
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getAllAdminUsers();
            setUsers(data.users || []);
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError(err.message || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch { return 'Invalid Date'; }
    };

    // --- Action Handlers ---
    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleSaveUserUpdate = (updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(u => u._id === updatedUser._id ? { ...u, ...updatedUser } : u));
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            setDeletingUserId(userId);
            setError(null);
            try {
                await userService.deleteUserByAdmin(userId);
                setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
            } catch (err: any) {
                console.error("Error deleting user:", err);
                const errorMsg = err.message || 'Failed to delete user.';
                setError(errorMsg);
                alert(`Error deleting user: ${errorMsg}`);
            } finally {
                setDeletingUserId(null);
            }
        }
    };

    const handleRefresh = () => fetchUsers();

    return (
        <>
            {/* Using a faux header section outside the main content to fix spacing issues */}
            <div className="w-full pt-16 pb-10 mb-8 bg-transparent">
                <h1 className="text-3xl font-bold text-white">User Management</h1>
            </div>

            {/* Main content container */}
            <div className="relative w-full">
                {/* Action buttons - absolutely positioned relative to page top */}
                <div className="absolute top-[-80px] right-0 flex flex-col sm:flex-row justify-end items-center gap-3">
                    <button 
                        onClick={handleRefresh} 
                        disabled={loading} 
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-white/20 shadow-sm text-sm font-medium rounded-md text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 relative z-10 transition-all duration-200"
                    >
                        <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>

                {/* Display general error above table if needed */}
                {!loading && error && !deletingUserId && (
                    <div className="mb-6">
                        <ErrorDisplay message={error} />
                    </div>
                )}

                <div className="bg-emerald-900/10 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/15">
                            <thead className="bg-emerald-900/20 backdrop-blur-sm">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th scope="col" className="relative px-6 py-4">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 bg-white/5 backdrop-blur-sm">
                                {loading && !users.length && (
                                    <tr>
                                        <td colSpan={5}>
                                            <LoadingIndicator />
                                        </td>
                                    </tr>
                                )}
                                {!loading && error && (
                                    <tr>
                                        <td colSpan={5}>
                                            <ErrorDisplay message={error} />
                                        </td>
                                    </tr>
                                )}
                                {!loading && !error && users.length === 0 && <NoUsersRow />}
                                {!loading && !error && users.map((user) => (
                                    <tr key={user._id} className={`hover:bg-emerald-800/10 transition-colors ${deletingUserId === user._id ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10 border border-emerald-500/20 shadow-md">
                                                    <img 
                                                        className="h-full w-full object-cover" 
                                                        src={user.avatar ? `${BACKEND_BASE_URL}${user.avatar}` : FALLBACK_AVATAR} 
                                                        alt={user.name} 
                                                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-base font-medium text-white">{user.name}</div>
                                                    <div className="text-sm text-emerald-200/80">{user.phone || ''}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-white/90">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                user.role === 'admin' 
                                                    ? 'bg-red-500/20 text-red-300 ring-1 ring-red-400/30' 
                                                    : user.role === 'trainer' 
                                                    ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30' 
                                                    : user.role === 'facilityOwner' 
                                                    ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30' 
                                                    : 'bg-white/10 text-white/80 ring-1 ring-white/30'
                                            }`}>
                                                <span className={`h-2 w-2 rounded-full mr-1.5 ${
                                                    user.role === 'admin' 
                                                        ? 'bg-red-400' 
                                                        : user.role === 'trainer' 
                                                        ? 'bg-blue-400' 
                                                        : user.role === 'facilityOwner' 
                                                        ? 'bg-emerald-400' 
                                                        : 'bg-white/60'
                                                }`}></span>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    disabled={!!deletingUserId}
                                                    className="text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Edit User"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                                    disabled={!!deletingUserId}
                                                    className="text-red-400 hover:text-red-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Delete User"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit User Modal */}
                <EditUserModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    user={selectedUser}
                    onSave={handleSaveUserUpdate}
                />
            </div>
        </>
    );
}