// src/components/admin/AdminTestimonialsTable.tsx
import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Testimonial } from '@/services/testimonialService';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_IMAGE = '/images/default-avatar.png';

interface AdminTestimonialsTableProps {
  testimonials: Testimonial[];
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (testimonialId: string) => void;
}

export default function AdminTestimonialsTable({
  testimonials,
  onEdit,
  onDelete,
}: AdminTestimonialsTableProps) {

  // FIXED: Updated image URL handling to handle both relative and absolute URLs
  const getImageUrl = (path?: string): string => {
    if (!path) return FALLBACK_IMAGE;
    
    // If already a full URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // For relative paths from backend
    if (path.startsWith('/')) {
      return `${BACKEND_BASE_URL}${path}`;
    }
    
    return FALLBACK_IMAGE;
  };

  return (
    <table className="min-w-full divide-y divide-white/15">
      <thead className="bg-emerald-900/20 backdrop-blur-sm">
        <tr>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Image
          </th>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Author
          </th>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Role
          </th>
          <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Content (Excerpt)
          </th>
          <th scope="col" className="px-4 py-4 text-center text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Active
          </th>
          <th scope="col" className="px-4 py-4 text-right text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10 bg-white/5 backdrop-blur-sm">
        {testimonials.map((testimonial) => (
          <tr key={testimonial._id} className="hover:bg-emerald-800/10 transition-colors duration-150">
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10 border border-emerald-500/20 shadow-md">
                {/* FIXED: Replaced Next.js Image with regular img tag */}
                <img
                  src={getImageUrl(testimonial.imageUrl)}
                  alt={`${testimonial.author}'s photo`}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
              </div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="text-base font-medium text-white">{testimonial.author}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="text-sm text-white/70">{testimonial.role || '-'}</div>
            </td>
            <td className="px-4 py-4 text-sm text-white/80 max-w-xs truncate" title={testimonial.content}>
              {testimonial.content}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-center">
              {testimonial.isActive ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-400 inline-block" title="Active" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-400 inline-block" title="Inactive" />
              )}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-right">
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => onEdit(testimonial)} 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
                  title="Edit Testimonial"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onDelete(testimonial._id)} 
                  className="text-red-400 hover:text-red-300 transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
                  title="Delete Testimonial"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {testimonials.length === 0 && (
          <tr>
            <td colSpan={6} className="text-center py-10 text-white/60">
              No testimonials found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}