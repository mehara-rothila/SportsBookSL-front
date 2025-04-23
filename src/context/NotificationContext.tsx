// src/context/NotificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import * as authService from '@/services/authService';
import * as notificationService from '@/services/notificationService';
import type { Notification } from '@/services/notificationService'; // Import type

interface NotificationContextType {
    unreadCount: number;
    incrementUnreadCount: () => void; // Simple increment for new notifications
    setUnreadCount: (count: number) => void; // To set initial/updated count
    notifications: Notification[]; // Optional: keep a local list
    addNotification: (notification: Notification) => void; // Add to local list
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001'; // Your backend URL

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]); // Store recent notifications
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check auth state
    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
    }, []); // Check once on mount

    // Function to fetch initial count
    const fetchInitialCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            console.log("[NotificationContext] Fetching initial unread count...");
            const data = await notificationService.getUserNotifications({ limit: 0 }); // Fetch only count
            setUnreadCount(data.unreadCount || 0);
            console.log("[NotificationContext] Initial unread count set:", data.unreadCount);
        } catch (error) {
            console.error("[NotificationContext] Error fetching initial unread count:", error);
        }
    }, [isAuthenticated]);

    // Connect/Disconnect Socket based on auth state
    useEffect(() => {
        if (isAuthenticated) {
            console.log("[NotificationContext] User authenticated, attempting Socket.IO connection...");
            const newSocket = io(SOCKET_URL, {
                // transports: ['websocket'], // Optional: force websocket
                reconnectionAttempts: 5,
                timeout: 10000,
            });

            newSocket.on('connect', () => {
                console.log('[Socket.IO Client] Connected:', newSocket.id);
                setIsConnected(true);
                // Send token for authentication
                const token = localStorage.getItem('userToken');
                if (token) {
                    newSocket.emit('authenticate', token);
                    console.log('[Socket.IO Client] Emitted authenticate event with token.');
                } else {
                    console.warn('[Socket.IO Client] No token found, cannot authenticate socket.');
                    newSocket.disconnect(); // Disconnect if no token
                }
            });

            newSocket.on('authenticated', () => {
                console.log('[Socket.IO Client] Socket authenticated successfully.');
                // Fetch initial count *after* authentication is confirmed
                fetchInitialCount();
            });

            newSocket.on('connect_error', (error) => {
                console.error('[Socket.IO Client] Connection Error:', error.message, error.cause);
                setIsConnected(false);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('[Socket.IO Client] Disconnected:', reason);
                setIsConnected(false);
                // Attempt to reconnect on certain disconnect reasons if needed
                if (reason === 'io server disconnect') {
                    // The server forced disconnection, maybe try reconnecting later
                    // newSocket.connect(); // Be careful with auto-reconnect loops
                }
            });

            setSocket(newSocket);

            // Cleanup on unmount or when auth state changes
            return () => {
                console.log('[Socket.IO Client] Disconnecting socket...');
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            };
        } else {
            // Ensure disconnection if user logs out
            if (socket) {
                console.log('[NotificationContext] User logged out, disconnecting socket.');
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]); // Re-run only when authentication status changes


    // Listen for socket events when connected
    useEffect(() => {
        if (socket && isConnected) {
            console.log('[Socket.IO Client] Setting up event listeners...');

            const handleNewNotification = (newNotification: Notification) => {
                console.log('[Socket.IO Client] Received new_notification:', newNotification);
                // Add to the beginning of the local list (optional)
                setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep max 20 local
                // Simple increment - reliable if only one connection expected per user
                // setUnreadCount(prev => prev + 1);
                 // Or fetch count again for accuracy if needed, but less "real-time" feel
                 fetchInitialCount(); // Refetch count to be sure
            };

            const handleUpdateCount = (data: { count: number }) => {
                console.log('[Socket.IO Client] Received unread_count_update:', data);
                setUnreadCount(data.count);
            };

            socket.on('new_notification', handleNewNotification);
            socket.on('unread_count_update', handleUpdateCount);

            // Cleanup listeners
            return () => {
                console.log('[Socket.IO Client] Removing event listeners...');
                socket.off('new_notification', handleNewNotification);
                socket.off('unread_count_update', handleUpdateCount);
            };
        }
    }, [socket, isConnected, fetchInitialCount]); // Add fetchInitialCount dependency

    // --- Context Functions ---
    const incrementUnreadCount = () => setUnreadCount(prev => prev + 1);
    const addNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 19)]);
    };

    return (
        <NotificationContext.Provider value={{ unreadCount, setUnreadCount, incrementUnreadCount, notifications, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
}