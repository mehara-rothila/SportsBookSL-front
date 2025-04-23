// src/components/admin/EditUserModal.tsx
'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import * as userService from '@/services/userService';

// Interface for the user data passed to the modal
interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'trainer' | 'facilityOwner';
    phone?: string;
    address?: string;
}

// Interface for the props the modal accepts
interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (updatedUser: User) => void;
}

const userRoles: User['role'][] = ['user', 'admin', 'trainer', 'facilityOwner'];

export default function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps) {
  const [editedData, setEditedData] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form when the user prop changes
  useEffect(() => {
    if (user) {
      setEditedData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'user',
      });
      setError(null);
    } else {
        setEditedData({});
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: User['role']) => {
      setEditedData(prev => ({ ...prev, role: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true); setError(null);
    try {
        const dataToUpdate: Partial<User> = {};
        if (editedData.name !== user.name) dataToUpdate.name = editedData.name;
        if (editedData.email !== user.email) dataToUpdate.email = editedData.email;
        if (editedData.phone !== (user.phone || '')) dataToUpdate.phone = editedData.phone;
        if (editedData.address !== (user.address || '')) dataToUpdate.address = editedData.address;
        if (editedData.role !== user.role) dataToUpdate.role = editedData.role;

        if (Object.keys(dataToUpdate).length === 0) {
             onClose(); setIsLoading(false); return;
        }

        const updatedUserFromApi = await userService.updateUserByAdmin(user._id, dataToUpdate);
        const finalUpdatedUser: User = { ...user, ...updatedUserFromApi };
        onSave(finalUpdatedUser);
        onClose();
    } catch (err: any) {
        console.error("Error saving user:", err);
        setError(err.message || "Failed to save changes.");
    } finally { setIsLoading(false); }
  };

  if (!isOpen || !user) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-emerald-900/20 backdrop-blur-md border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-white border-b border-white/10 pb-3 mb-4"
                >
                  Edit User: <span className="font-bold text-emerald-300">{user.name}</span>
                </Dialog.Title>

                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                  <div className="mt-4 space-y-5">
                    {/* Form Fields */}
                    <div>
                      <label htmlFor="edit-name" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="edit-name"
                        value={editedData.name || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-email" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="edit-email"
                        value={editedData.email || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-phone" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="edit-phone"
                        value={editedData.phone || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-address" className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                        Address
                      </label>
                      <textarea
                        name="address"
                        id="edit-address"
                        rows={2}
                        value={editedData.address || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md bg-white/5 backdrop-blur-sm border border-white/20 shadow-sm px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Optional"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
                        Role
                      </label>
                      <Listbox value={editedData.role} onChange={handleRoleChange}>
                        <div className="relative mt-1">
                          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white/5 backdrop-blur-sm border border-white/20 px-3 py-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                            <span className="block truncate text-white">
                              {editedData.role ? editedData.role.charAt(0).toUpperCase() + editedData.role.slice(1) : 'Select Role'}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-emerald-900/90 backdrop-blur-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              {userRoles.map((roleOption) => (
                                <Listbox.Option
                                  key={roleOption}
                                  className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-emerald-700/50 text-white' : 'text-emerald-200'
                                  }`}
                                  value={roleOption}
                                >
                                  {({ selected }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-400">
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="text-sm text-red-200 bg-red-900/30 p-3 rounded-md border border-red-500/30">
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-end space-x-3 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}