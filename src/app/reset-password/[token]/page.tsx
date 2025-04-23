// src/app/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as authService from '@/services/authService'; // Adjust path if needed
import toast from 'react-hot-toast';
import { EnvelopeIcon, KeyIcon, ArrowPathIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon, HashtagIcon } from '@heroicons/react/24/outline';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState(''); // <-- Need email input
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // No need for useEffect checking token from URL anymore

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !otp || !password || !confirmPassword) {
        setError('Please fill in all fields.');
        return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Resetting password...");

    try {
      // Call service with email, otp, and password
      const response = await authService.resetPassword(email, otp, password);
      toast.dismiss(loadingToast);
      if (response.success) {
        setSuccess(true);
        toast.success(response.message || "Password reset successfully!");
        setTimeout(() => {
            router.push('/login');
        }, 2500);
      } else {
          setError(response.message || 'Failed to reset password.');
          toast.error(response.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Reset Password Error:", err);
      setError(err.message || 'An unexpected error occurred. The OTP might be invalid or expired.');
      toast.error(err.message || 'Failed to reset password. OTP might be invalid or expired.');
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
            Reset Your Password
          </h2>
          {!success && (
             <p className="mt-2 text-center text-sm text-gray-600">
                Enter your email, the OTP sent to it, and your new password.
             </p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                <p className="text-sm font-medium text-green-700">Password reset successfully! Redirecting to login...</p>
            </div>
          </div>
        )}

        {!success && ( // Only show form if not successful
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              {/* Email Input */}
              <div className="relative group">
                 <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <EnvelopeIcon className="h-5 w-5" aria-hidden="true"/>
                 </span>
                 <input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="peer appearance-none relative block w-full pl-10 pr-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Your account email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                 />
              </div>
              {/* OTP Input */}
              <div className="relative group">
                 <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <HashtagIcon className="h-5 w-5" aria-hidden="true"/>
                 </span>
                 <input
                    id="otp"
                    name="otp"
                    type="text" // Use text, pattern optional for numbers
                    inputMode="numeric" // Hint for mobile keyboards
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    className="peer appearance-none relative block w-full pl-10 pr-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm tracking-[0.3em] font-mono" // Styling for OTP
                    placeholder="6-Digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Allow only numbers
                 />
              </div>
              {/* New Password */}
              <div className="relative group">
                 <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <KeyIcon className="h-5 w-5" aria-hidden="true"/>
                 </span>
                 <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="peer appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="New Password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                 />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                 >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                 </button>
              </div>
              {/* Confirm New Password */}
              <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <KeyIcon className="h-5 w-5" aria-hidden="true"/>
                 </span>
                 <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="peer appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                 />
                 <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                 >
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                 </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !email || !otp || !password || !confirmPassword}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out ${isLoading || !email || !otp || !password || !confirmPassword ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        )}

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