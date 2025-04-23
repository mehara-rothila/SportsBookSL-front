// src/app/facilities/page.tsx
import { Suspense } from 'react';
import FacilitiesContent from './FacilitiesContent';

export default function FacilitiesPage() {
  return (
    <Suspense fallback={
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-800 font-medium">Loading facilities...</p>
        </div>
      </div>
    }>
      <FacilitiesContent />
    </Suspense>
  );
}