// src/components/equipment/EquipmentRental.tsx

'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, MinusIcon, ShoppingCartIcon, CheckCircleIcon, InformationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

// Interface matching the equipment structure in your Facility model
interface EquipmentItem {
  _id?: string; // Optional ID if embedded
  name: string;
  pricePerHour: number; // Matches your Facility model
  available: number; // Matches your Facility model
}

interface EquipmentRentalProps {
  // Receive equipment data directly as a prop
  equipmentList: EquipmentItem[];
  // Callback to notify parent of selections
  onEquipmentSelect?: (selections: { [key: string]: number }) => void;
  // Initial selections might be passed down (e.g., from booking page query params)
  initialSelections?: { [key: string]: number };
  // Cricket theme toggle
  cricketTheme?: boolean;
}

export default function EquipmentRental({
  equipmentList = [], // Default to empty array
  onEquipmentSelect,
  initialSelections = {},
  cricketTheme = true
}: EquipmentRentalProps) {

  // No need for internal equipment state or loading state if data is passed in
  const [selectedEquipment, setSelectedEquipment] = useState<{ [key: string]: number }>(initialSelections);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Cricket-specific equipment categories
  const categories = [
    { id: 'all', name: 'All Equipment' },
    { id: 'bat', name: 'Bats' },
    { id: 'ball', name: 'Balls' },
    { id: 'protection', name: 'Protection' },
    { id: 'apparel', name: 'Apparel' },
  ];
  
  // Helper function to determine equipment category based on name
  const getCategory = (name: string): string => {
    name = name.toLowerCase();
    if (name.includes('bat')) return 'bat';
    if (name.includes('ball')) return 'ball';
    if (name.includes('pad') || name.includes('glove') || name.includes('helmet') || name.includes('guard')) return 'protection';
    if (name.includes('jersey') || name.includes('shoe') || name.includes('kit') || name.includes('uniform')) return 'apparel';
    return 'other';
  };

  // Filter equipment based on selected category
  const filteredEquipment = activeCategory === 'all' 
    ? equipmentList 
    : equipmentList.filter(item => getCategory(item.name) === activeCategory);

  // Update parent when selections change
  useEffect(() => {
    if (onEquipmentSelect) {
      onEquipmentSelect(selectedEquipment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEquipment]); // Removed onEquipmentSelect from deps as it's a function prop

  // Calculate the total cost of selected equipment (assuming 2hr slot)
  const calculateTotalCost = () => {
    return Object.entries(selectedEquipment).reduce((total, [equipName, quantity]) => {
      const item = equipmentList.find(eq => eq.name === equipName); // Find by name
      return total + (item ? item.pricePerHour * quantity * 2 : 0); // Use pricePerHour
    }, 0);
  };

  // Handle quantity change
  const handleQuantityChange = (equipName: string, change: number) => {
    const item = equipmentList.find(eq => eq.name === equipName);
    if (!item) return;

    const currentQty = selectedEquipment[equipName] || 0;
    // Use 'available' field from the prop data
    const newQty = Math.max(0, Math.min(item.available, currentQty + change));

    const newSelections = {
      ...selectedEquipment,
      [equipName]: newQty
    };

    if (newQty === 0) {
      delete newSelections[equipName];
    }

    setSelectedEquipment(newSelections);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  // Get equipment icon based on name
  const getEquipmentIcon = (name: string) => {
    // Simple function to return a cricket equipment SVG based on the name
    const category = getCategory(name);
    
    if (category === 'bat') {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-amber-400" strokeWidth="2" stroke="currentColor">
          <path d="M6,3 L18,20 M6,3 L10,3 L22,20 L18,20" strokeLinecap="round" />
        </svg>
      );
    }
    
    if (category === 'ball') {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-red-400" strokeWidth="2" stroke="currentColor">
          <circle cx="12" cy="12" r="8" />
          <path d="M12,4 C16,8 16,16 12,20 M4,12 C8,8 16,8 20,12" />
        </svg>
      );
    }
    
    if (category === 'protection') {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-400" strokeWidth="2" stroke="currentColor">
          <path d="M12,2 L20,5 C20,12 18,17 12,22 C6,17 4,12 4,5 L12,2 Z" />
        </svg>
      );
    }
    
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-emerald-400" strokeWidth="2" stroke="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8,8 L16,16 M8,16 L16,8" />
      </svg>
    );
  };

  return (
    <div className={`${
      cricketTheme 
        ? 'bg-gradient-to-br from-emerald-900/60 to-green-900/40 border border-white/20'
        : 'bg-white border border-gray-100'
    } rounded-lg shadow-lg overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-xl font-semibold ${cricketTheme ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <ShoppingCartIcon className={`w-6 h-6 mr-2 ${cricketTheme ? 'text-emerald-400' : 'text-emerald-600'}`} />
              Equipment Rental
            </h2>
            <p className={`${cricketTheme ? 'text-white/70' : 'text-gray-600'} mt-1`}>
              Rent quality equipment for your cricket session
            </p>
          </div>
          
          {Object.keys(selectedEquipment).length > 0 && (
            <div className={`${
              cricketTheme
                ? 'bg-emerald-800/60 text-white'
                : 'bg-emerald-100 text-emerald-800'
            } rounded-full px-3 py-1 text-sm font-medium flex items-center`}>
              <span className="mr-1">{Object.values(selectedEquipment).reduce((a, b) => a + b, 0)}</span>
              <span>Selected</span>
            </div>
          )}
        </div>

        {/* Category tabs */}
        <div className="mb-6">
          <div className={`flex overflow-x-auto space-x-2 py-2 ${cricketTheme ? 'scrollbar-cricket' : ''}`}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? cricketTheme
                      ? 'bg-emerald-600 text-white shadow-md scale-105'
                      : 'bg-emerald-600 text-white shadow-md'
                    : cricketTheme
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment list */}
        <div className="mt-6 space-y-4">
          {filteredEquipment.length === 0 ? (
            <div className={`text-center py-12 ${
              cricketTheme
                ? 'bg-white/10 text-white/70'
                : 'bg-gray-50 text-gray-500'
            } rounded-lg`}>
              <div className="flex flex-col items-center">
                <InformationCircleIcon className={`w-12 h-12 ${cricketTheme ? 'text-emerald-400' : 'text-gray-400'} mb-2`} />
                <p>No {activeCategory !== 'all' ? categories.find(c => c.id === activeCategory)?.name : ''} equipment available for rent at this facility.</p>
                {activeCategory !== 'all' && (
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className={`mt-4 flex items-center ${
                      cricketTheme
                        ? 'text-emerald-400 hover:text-emerald-300'
                        : 'text-emerald-600 hover:text-emerald-700'
                    }`}
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                    Show all equipment
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredEquipment.map(item => (
              <div
                key={item.name} // Use name as key if _id isn't guaranteed
                className={`${
                  cricketTheme
                    ? 'border border-white/20 bg-white/10 hover:bg-white/15'
                    : 'border border-gray-200 hover:shadow-md'
                } rounded-lg overflow-hidden transition-all hover:scale-[1.02] duration-200`}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Equipment details section */}
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className={`p-2 mr-3 rounded-lg ${
                          cricketTheme
                            ? 'bg-emerald-900/60'
                            : 'bg-emerald-100'
                        }`}>
                          {getEquipmentIcon(item.name)}
                        </div>
                        <div>
                          <h3 className={`font-medium ${cricketTheme ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </h3>
                          <div className={`text-sm ${cricketTheme ? 'text-emerald-300' : 'text-emerald-600'}`}>
                            {formatCurrency(item.pricePerHour)}/hr
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {/* Availability indicator */}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.available > 5 
                          ? cricketTheme ? 'bg-emerald-800/60 text-emerald-200' : 'bg-green-100 text-green-800'
                          : item.available > 0 
                            ? cricketTheme ? 'bg-amber-800/60 text-amber-200' : 'bg-yellow-100 text-yellow-800'
                            : cricketTheme ? 'bg-red-900/60 text-red-200' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.available} available
                      </span>

                      {/* Quantity selector */}
                      <div className="flex items-center">
                        <div className={`flex items-center ${
                          cricketTheme
                            ? 'border border-white/20 bg-white/5 rounded-md'
                            : 'border border-gray-300 rounded-md'
                        }`}>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.name, -1)}
                            disabled={!selectedEquipment[item.name]}
                            className={`p-2 focus:outline-none ${
                              !selectedEquipment[item.name] 
                                ? cricketTheme ? 'text-gray-500/40 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                                : cricketTheme ? 'text-white hover:text-emerald-300' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className={`w-10 text-center ${cricketTheme ? 'text-white' : 'text-gray-700'}`}>
                            {selectedEquipment[item.name] || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.name, 1)}
                            disabled={item.available <= (selectedEquipment[item.name] || 0)}
                            className={`p-2 focus:outline-none ${
                              item.available <= (selectedEquipment[item.name] || 0) 
                                ? cricketTheme ? 'text-gray-500/40 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                                : cricketTheme ? 'text-white hover:text-emerald-300' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {selectedEquipment[item.name] > 0 && (
                          <span className={`ml-3 text-sm font-medium ${cricketTheme ? 'text-emerald-300' : 'text-gray-900'}`}>
                            {formatCurrency(item.pricePerHour * selectedEquipment[item.name] * 2)} (Est. 2hr)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order summary */}
        {Object.keys(selectedEquipment).length > 0 && (
          <div className={`mt-8 ${
            cricketTheme
              ? 'bg-emerald-900/50 border border-white/20'
              : 'bg-gray-50 border border-gray-200'
          } rounded-lg p-4`}>
            <h3 className={`font-medium ${cricketTheme ? 'text-white' : 'text-gray-900'} mb-3 flex items-center`}>
              <CheckCircleIcon className={`w-5 h-5 mr-2 ${cricketTheme ? 'text-emerald-400' : 'text-emerald-600'}`} />
              Selected Equipment Summary
            </h3>
            <div className="space-y-2 mb-4">
              {Object.entries(selectedEquipment).map(([equipName, quantity]) => {
                const item = equipmentList.find(eq => eq.name === equipName);
                if (!item || quantity === 0) return null;
                return (
                  <div key={equipName} className="flex justify-between">
                    <span className={`text-sm ${cricketTheme ? 'text-white/70' : 'text-gray-600'}`}>
                      {item.name} × {quantity}
                    </span>
                    <span className={`text-sm font-medium ${cricketTheme ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(item.pricePerHour * quantity * 2)} (Est. 2hr)
                    </span>
                  </div>
                );
              })}
            </div>
            <div className={`border-t ${
              cricketTheme ? 'border-white/20' : 'border-gray-200'
            } pt-3 flex justify-between items-center`}>
              <span className={`font-medium ${cricketTheme ? 'text-white' : 'text-gray-900'}`}>Equipment Subtotal</span>
              <span className={`font-bold ${cricketTheme ? 'text-emerald-300' : 'text-emerald-700'}`}>
                {formatCurrency(calculateTotalCost())}
              </span>
            </div>
          </div>
        )}
      </div>
    
      {/* Cricket-themed decorative elements */}
      {cricketTheme && (
        <>
          <div className="absolute top-6 right-6 w-32 h-32 bg-white/5 rounded-full opacity-20 -z-10"></div>
          <div className="absolute bottom-12 left-10 w-24 h-24 bg-white/5 rounded-full opacity-30 -z-10"></div>
        </>
      )}
      
      <style jsx global>{`
        /* Custom scrollbar for cricket theme */
        .scrollbar-cricket::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-cricket::-webkit-scrollbar-track {
          background: rgba(16, 185, 129, 0.1);
          border-radius: 10px;
        }
        .scrollbar-cricket::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 10px;
        }
        .scrollbar-cricket::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
}