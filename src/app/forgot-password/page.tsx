// src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as authService from '@/services/authService'; // Adjust path if needed
import toast from 'react-hot-toast';
import { EnvelopeIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(''); // For success/info messages
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.message); // Display success message from backend (e.g., "OTP sent...")
      toast.success("Password reset OTP sent (if account exists).");
      // Keep user on this page to see the message
    } catch (err: any) {
      console.error("Forgot Password Error:", err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Failed to send reset OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-100 via-white to-blue-50 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent-200/30 rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 max-w-md w-full space-y-8 backdrop-blur-md bg-white/80 p-8 md:p-10 rounded-2xl shadow-2xl border border-white/50">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            No problem! Enter your email below and we'll send you a 6-digit code to reset it.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {message && !error && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm font-medium text-green-700">{message}</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <EnvelopeIcon className="h-5 w-5" aria-hidden="true"/>
                 </div>
                 <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="peer appearance-none relative block w-full pl-10 pr-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your account email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                 />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !!message} // Disable if loading or success message shown
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out ${isLoading || message ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  Sending...
                </>
              ) : message ? (
                 <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Instructions Sent (Check Email)
                 </>
              ) : (
                'Send Reset OTP'
              )}
            </button>
          </div>
        </form>

        <div className="text-sm text-center mt-6">
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Back to Sign in
          </Link>
        </div>
      </div>
        {/* Add Animation Styles if needed */}
        <style jsx>{`
            @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob { animation: blob 10s infinite alternate; }
            .animation-delay-2000 { animation-delay: 2s; }
        `}</style>
    </div>
  );
}