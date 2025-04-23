'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, isToday, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';

// Types
type BookingSlot = {
  time: string;
  available: boolean;
};

type DateAvailability = {
  date: Date; // Store as Date object for easier comparison
  slots: BookingSlot[];
};

interface BookingCalendarProps {
  availableDates?: DateAvailability[]; // Expecting Date objects now
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  selectedDate?: Date | null; // Allow null for initial state
  selectedTime?: string;
  minDate?: Date;
  maxDate?: Date;
  currentMonth?: Date;
  onMonthChange?: (date: Date) => void;
  cricketTheme?: boolean; // Optional theme flag to enable cricket styling
}

// Helper for class names
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function BookingCalendar({
  availableDates = [],
  onDateSelect,
  onTimeSelect,
  selectedDate = null,
  selectedTime = '',
  minDate = startOfDay(new Date()),
  maxDate = addMonths(new Date(), 3),
  currentMonth: externalCurrentMonth,
  onMonthChange,
  cricketTheme = true // Default to cricket theme for consistency
}: BookingCalendarProps) {
  const [internalCurrentMonth, setInternalCurrentMonth] = useState(startOfMonth(selectedDate || new Date()));
  
  // Use external state if provided, otherwise use internal state
  const currentMonth = externalCurrentMonth || internalCurrentMonth;
  
  // Handle month change
  const handleMonthChange = (newMonth: Date) => {
    if (onMonthChange) {
      onMonthChange(newMonth);
    } else {
      setInternalCurrentMonth(newMonth);
    }
  };
  
  // Memoize available dates map for performance
  const availabilityMap = useMemo(() => {
    const map = new Map<string, { hasSlots: boolean; slots: BookingSlot[] }>();
    availableDates.forEach(d => {
      const dateKey = format(d.date, 'yyyy-MM-dd');
      const hasAvailableSlots = d.slots.some(slot => slot.available);
      map.set(dateKey, { hasSlots: hasAvailableSlots, slots: d.slots });
    });
    return map;
  }, [availableDates]);

  // Generate days for the calendar grid
  const daysInGrid = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfDay(subMonths(monthStart, 0)); // Adjust if showing previous month days needed
    const endDate = startOfDay(addMonths(monthEnd, 0));   // Adjust if showing next month days needed

    // Simplified: Only show days of the current month for clarity
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding for start day alignment
    const startDayOfWeek = getDay(monthStart); // 0 = Sunday, 6 = Saturday
    const paddingDays = Array(startDayOfWeek).fill(null);

    return [...paddingDays, ...days];
  }, [currentMonth]);

  // Get available time slots for the selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return availabilityMap.get(dateKey)?.slots || [];
  }, [selectedDate, availabilityMap]);

  // Navigation handlers
  const prevMonth = () => handleMonthChange(subMonths(currentMonth, 1));
  const nextMonth = () => handleMonthChange(addMonths(currentMonth, 1));

  // Check if a date is disabled
  const isDateDisabled = (date: Date | null): boolean => {
    if (!date) return true; // Null dates (padding) are disabled
    const dateKey = format(date, 'yyyy-MM-dd');
    const today = startOfDay(new Date());
    return isBefore(date, minDate && startOfDay(minDate)) ||
           isAfter(date, maxDate && startOfDay(maxDate)) ||
           !availabilityMap.has(dateKey) ||
           !availabilityMap.get(dateKey)?.hasSlots;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Cricket theme styles
  const cricketStyles = {
    container: "bg-gradient-to-br from-emerald-900/60 to-green-900/40 backdrop-blur-sm",
    header: "flex justify-between items-center px-4 py-2 border-b border-white/20",
    monthTitle: "text-lg font-bold text-white",
    navButton: "text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors",
    dayNameText: "text-white/80",
    dateButton: {
      base: "text-white hover:text-emerald-300 hover:bg-white/10",
      selected: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md",
      today: "border-2 border-emerald-500 font-bold",
      disabled: "text-gray-500/50 cursor-not-allowed"
    },
    timeButton: {
      base: "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-emerald-400",
      selected: "bg-emerald-600 text-white border-emerald-700 shadow-md",
      disabled: "bg-gray-800/40 text-gray-500/60 border-gray-700/30"
    },
    summary: "bg-gradient-to-r from-emerald-900/50 to-green-900/50 border-t-2 border-emerald-600/30"
  };

  // Default styles
  const defaultStyles = {
    container: "bg-white",
    header: "flex justify-between items-center px-4 py-2 border-b border-gray-200",
    monthTitle: "text-lg font-medium text-gray-900",
    navButton: "text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors",
    dayNameText: "text-gray-500",
    dateButton: {
      base: "text-gray-800 hover:bg-primary-100 hover:text-primary-700",
      selected: "bg-primary-600 text-white font-semibold shadow-md",
      today: "border-2 border-primary-500 font-bold",
      disabled: "text-gray-300 cursor-not-allowed"
    },
    timeButton: {
      base: "bg-white text-primary-700 border-primary-300 hover:bg-primary-50 hover:border-primary-500",
      selected: "bg-primary-600 text-white border-primary-700 shadow-md",
      disabled: "bg-gray-100 text-gray-400 border-gray-200"
    },
    summary: "bg-gradient-to-r from-primary-50 to-blue-50"
  };

  // Choose style based on theme
  const styles = cricketTheme ? cricketStyles : defaultStyles;

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden border ${cricketTheme ? 'border-white/20' : 'border-gray-200/75'} ${styles.container} relative`}>
      {/* Calendar Header with month/year and navigation */}
      <div className={styles.header}>
        <button 
          onClick={prevMonth}
          className={styles.navButton}
          aria-label="Previous month"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button 
          onClick={nextMonth}
          className={styles.navButton}
          aria-label="Next month"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Grid of days */}
      <div className="p-4">
        <div className={`grid grid-cols-7 gap-1 text-center text-xs font-semibold ${styles.dayNameText} uppercase tracking-wider mb-3`}>
          {dayNames.map((day) => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {daysInGrid.map((day, index) => {
            const isPadding = day === null;
            const isDisabled = isDateDisabled(day);
            const isSelected = !isPadding && selectedDate ? isSameDay(day, selectedDate) : false;
            const isCurrentMonthDay = !isPadding && isSameMonth(day, currentMonth); // Ensure it's current month
            const isTodayFlag = !isPadding && isToday(day);

            return (
              <div key={isPadding ? `pad-${index}` : day.toISOString()} className="aspect-square flex items-center justify-center">
                {!isPadding && isCurrentMonthDay ? (
                  <button
                    type="button"
                    onClick={() => !isDisabled && onDateSelect(day)}
                    disabled={isDisabled}
                    className={classNames(
                      'relative h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-400',
                      isSelected 
                        ? styles.dateButton.selected + ' scale-105'
                        : '',
                      !isSelected && !isDisabled 
                        ? styles.dateButton.base 
                        : '',
                      !isSelected && isDisabled 
                        ? styles.dateButton.disabled 
                        : '',
                      isTodayFlag && !isSelected 
                        ? styles.dateButton.today 
                        : '',
                      !isTodayFlag && !isSelected && !isDisabled 
                        ? 'border border-transparent' 
                        : ''
                    )}
                  >
                    <time dateTime={format(day, 'yyyy-MM-dd')}>
                      {format(day, 'd')}
                    </time>
                    {/* Availability Indicator */}
                    {!isDisabled && !isSelected && (
                      <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 ${
                        cricketTheme 
                          ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                          : 'bg-gradient-to-br from-green-400 to-emerald-500'
                      } rounded-full shadow-sm animate-pulse-slow`}></span>
                    )}
                  </button>
                ) : (
                  // Render empty div for padding or days outside current month
                  <div></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time slots section */}
      {selectedDate && (
        <div className={`border-t ${cricketTheme ? 'border-white/20' : 'border-gray-200'} p-5 ${cricketTheme ? 'bg-emerald-900/30' : 'bg-gray-50/70'} animate-fade-in`}>
          <h3 className={`text-base font-semibold ${cricketTheme ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
            <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Available Times for {format(selectedDate, 'MMM d, yyyy')}
          </h3>
          {availableTimeSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableTimeSlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => slot.available && onTimeSelect(slot.time)}
                  className={classNames(
                    'py-2.5 px-3 text-sm font-medium rounded-lg border transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1',
                    cricketTheme ? 'focus:ring-emerald-400' : 'focus:ring-primary-400',
                    !slot.available
                      ? styles.timeButton.disabled + ' cursor-not-allowed line-through opacity-70'
                      : selectedTime === slot.time
                        ? styles.timeButton.selected + ' scale-105 font-semibold'
                        : styles.timeButton.base
                  )}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          ) : (
            <div className={`text-center ${cricketTheme ? 'bg-emerald-800/40' : 'bg-gray-100'} rounded-lg py-8 px-4 border ${cricketTheme ? 'border-white/10' : 'border-gray-200'}`}>
              <svg className={`w-10 h-10 mx-auto mb-3 ${cricketTheme ? 'text-emerald-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`text-center ${cricketTheme ? 'text-white/60' : 'text-gray-500'} text-sm`}>
                No available time slots for this date.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selection Summary */}
      {selectedDate && selectedTime && (
        <div className={`border-t-2 ${cricketTheme ? 'border-emerald-800/50' : 'border-primary-200'} p-4 ${styles.summary}`}>
          <div className="text-center">
            <p className={`text-sm font-medium ${cricketTheme ? 'text-emerald-300' : 'text-primary-800'}`}>Your selection:</p>
            <p className={`font-semibold ${cricketTheme ? 'text-white' : 'text-gray-900'} mt-1 flex items-center justify-center`}>
              <svg className="w-4 h-4 mr-1.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              <span className={`mx-2 ${cricketTheme ? 'text-gray-400/60' : 'text-gray-400'}`}>|</span>
              <svg className="w-4 h-4 mr-1.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {selectedTime}
            </p>
          </div>
        </div>
      )}

      {/* Cricket theme decorative elements */}
      {cricketTheme && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full"></div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/5 rounded-full"></div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}