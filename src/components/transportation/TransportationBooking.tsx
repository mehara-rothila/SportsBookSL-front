// src/components/equipment/EquipmentRental.tsx

'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: string;
  rentalCost: number;
  quantity: number;
  availableQuantity: number;
  image: string;
}

interface EquipmentRentalProps {
  facilityId: string;
  sportType: string;
  bookingId?: string;
  onEquipmentSelect?: (selections: { [key: string]: number }) => void;
}

export default function EquipmentRental({ facilityId, sportType, bookingId, onEquipmentSelect }: EquipmentRentalProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<{ [key: string]: number }>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // In a real application, this would fetch from an API
  useEffect(() => {
    // Mock equipment data
    setTimeout(() => {
      const mockEquipment = [
        {
          id: 'eq-1',
          name: 'Cricket Bat',
          description: 'Professional grade cricket bat',
          category: 'Cricket',
          condition: 'Excellent',
          rentalCost: 500,
          quantity: 15,
          availableQuantity: 10,
          image: 'https://images.unsplash.com/photo-1580691155297-c6dfa3ca6ff9'
        },
        {
          id: 'eq-2',
          name: 'Cricket Ball (Set of 6)',
          description: 'Match quality cricket balls',
          category: 'Cricket',
          condition: 'Good',
          rentalCost: 800,
          quantity: 10,
          availableQuantity: 6,
          image: 'https://images.unsplash.com/photo-1562077981-4d7eafd44932'
        },
        {
          id: 'eq-3',
          name: 'Batting Gloves',
          description: 'Protective batting gloves',
          category: 'Cricket',
          condition: 'Very Good',
          rentalCost: 250,
          quantity: 20,
          availableQuantity: 15,
          image: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913'
        },
        {
          id: 'eq-4',
          name: 'Helmet',
          description: 'Cricket batting helmet',
          category: 'Cricket',
          condition: 'Excellent',
          rentalCost: 350,
          quantity: 12,
          availableQuantity: 8,
          image: 'https://images.unsplash.com/photo-1622819584099-e04ccb14e8a7'
        },
        {
          id: 'eq-5',
          name: 'Wicket Keeping Gloves',
          description: 'Professional wicket keeping gloves',
          category: 'Cricket',
          condition: 'Good',
          rentalCost: 400,
          quantity: 8,
          availableQuantity: 5,
          image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0'
        },
        {
          id: 'eq-6',
          name: 'Tennis Racket',
          description: 'Premium tennis racket',
          category: 'Tennis',
          condition: 'Very Good',
          rentalCost: 600,
          quantity: 10,
          availableQuantity: 7,
          image: 'https://images.unsplash.com/photo-1548527848-4f2472cdd400'
        },
        {
          id: 'eq-7',
          name: 'Swimming Goggles',
          description: 'Competition swimming goggles',
          category: 'Swimming',
          condition: 'Excellent',
          rentalCost: 150,
          quantity: 25,
          availableQuantity: 20,
          image: 'https://images.unsplash.com/photo-1562157870-2a0aeb6d429d'
        }
      ];
      
      setEquipment(mockEquipment);
      setIsLoading(false);
    }, 1000);
  }, [facilityId, sportType]);
  
  // Get all available equipment categories
  const categories = ['all', ...Array.from(new Set(equipment.map(eq => eq.category)))];
  
  // Filter equipment by active category
  const filteredEquipment = activeCategory === 'all' 
    ? equipment 
    : equipment.filter(eq => eq.category === activeCategory);
  
  // Calculate the total cost of selected equipment
  const calculateTotalCost = () => {
    return Object.entries(selectedEquipment).reduce((total, [equipId, quantity]) => {
      const item = equipment.find(eq => eq.id === equipId);
      return total + (item ? item.rentalCost * quantity : 0);
    }, 0);
  };
  
  // Handle quantity change
  const handleQuantityChange = (equipId: string, change: number) => {
    const item = equipment.find(eq => eq.id === equipId);
    if (!item) return;
    
    const currentQty = selectedEquipment[equipId] || 0;
    const newQty = Math.max(0, Math.min(item.availableQuantity, currentQty + change));
    
    const newSelections = {
      ...selectedEquipment,
      [equipId]: newQty
    };
    
    // Remove item from selections if quantity is 0
    if (newQty === 0) {
      delete newSelections[equipId];
    }
    
    setSelectedEquipment(newSelections);
    
    // Notify parent component if callback is provided
    if (onEquipmentSelect) {
      onEquipmentSelect(newSelections);
    }
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow p-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="flex space-x-2 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded mb-4"></div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900">Equipment Rental</h2>
        <p className="text-gray-600 mt-1">Rent quality equipment for your sports session</p>
        
        {/* Category tabs */}
        <div className="flex overflow-x-auto space-x-2 mt-4 pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Equipment' : category}
            </button>
          ))}
        </div>
        
        {/* Equipment list */}
        <div className="mt-6 space-y-4">
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">No equipment available in this category</p>
            </div>
          ) : (
            filteredEquipment.map(item => (
              <div 
                key={item.id} 
                className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-32 h-32 sm:h-auto bg-gray-100">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <span className="font-medium text-gray-900">Rs. {item.rentalCost}/hr</span>
                    </div>
                    
                    <div className="mt-2 flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                        item.condition === 'Very Good' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.condition}
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-xs text-gray-500">
                        {item.availableQuantity} available
                      </span>
                    </div>
                    
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={!selectedEquipment[item.id]}
                          className={`p-2 focus:outline-none ${
                            !selectedEquipment[item.id] ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-gray-700">
                          {selectedEquipment[item.id] || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          disabled={item.availableQuantity <= (selectedEquipment[item.id] || 0)}
                          className={`p-2 focus:outline-none ${
                            item.availableQuantity <= (selectedEquipment[item.id] || 0) 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {selectedEquipment[item.id] > 0 && (
                        <span className="text-sm font-medium text-gray-900">
                          Rs. {item.rentalCost * selectedEquipment[item.id]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Order summary */}
        {Object.keys(selectedEquipment).length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Selected Equipment</h3>
            
            <div className="space-y-2 mb-4">
              {Object.entries(selectedEquipment).map(([equipId, quantity]) => {
                const item = equipment.find(eq => eq.id === equipId);
                if (!item || quantity === 0) return null;
                
                return (
                  <div key={equipId} className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {item.name} × {quantity}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      Rs. {item.rentalCost * quantity}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-bold text-gray-900">Rs. {calculateTotalCost()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}