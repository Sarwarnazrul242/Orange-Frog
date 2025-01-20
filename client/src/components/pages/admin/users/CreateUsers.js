import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { HoverBorderGradient } from '../../../ui/hover-border-gradient';

export default function CreateUsers({ onUserCreated }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isFormClosing, setIsFormClosing] = useState(false);
    const [formData, setFormData] = useState({ 
        name: "", 
        email: "", 
        hourlyRate: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCancel = () => {
        setIsFormClosing(true);
        setTimeout(() => {
            setShowAddForm(false);
            setIsFormClosing(false);
            setFormData({ name: "", email: "", hourlyRate: "" });
        }, 100);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    hourlyRate: formData.hourlyRate
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            toast.success('User created successfully!', {
                duration: 3000,
            });
            
            setFormData({ name: "", email: "", hourlyRate: "" });
            handleCancel();
            
            if (onUserCreated) {
                onUserCreated();
            }
        } catch (error) {
            toast.error(
                error.message || 'Failed to create user. Please try again.',
                {
                    duration: 4000,
                }
            );
            console.error("Error creating user:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex items-center mb-3">
            <AnimatePresence mode="wait">
                {!showAddForm ? (
                    <motion.div
                        key="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <HoverBorderGradient
                            onClick={() => setShowAddForm(true)}
                            className="rounded-full cursor-pointer"
                        >
                            <div className="px-4 py-1 flex items-center space-x-2">
                                <FaPlus className="text-white" />
                                <span className="text-white">Add New User</span>
                            </div>
                        </HoverBorderGradient>
                    </motion.div>
                ) : (
                    <motion.form
                        key="form"
                        className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-4xl"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ 
                            opacity: isFormClosing ? 0 : 1, 
                            y: isFormClosing ? -20 : 0 
                        }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleFormSubmit}
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex-1"
                        >
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-white mb-2 ml-6"
                            >
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter name"
                                value={formData.name}
                                onChange={handleInputChange}
                                maxLength={30}
                                className="w-full px-4 py-2 rounded-full bg-neutral-900 text-white placeholder:text-white/50 outline-none border border-neutral-700 focus:border-neutral-500"
                                required
                            />
                            
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex-1"
                        >
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-white mb-2 ml-6"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter email"
                                value={formData.email}
                                onChange={handleInputChange}
                                maxLength={50}
                                className="w-full px-4 py-2 rounded-full bg-neutral-900 text-white placeholder:text-white/50 outline-none border border-neutral-700 focus:border-neutral-500"
                                required
                            />
                            
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex-1 max-w-[150px]"
                        >
                            <label
                                htmlFor="hourlyRate"
                                className="block text-sm font-medium text-white mb-2 ml-6"
                            >
                                Hourly Rate ($)
                            </label>
                            <input
                                type="number"
                                id="hourlyRate"
                                name="hourlyRate"
                                value={formData.hourlyRate}
                                onChange={handleInputChange}
                                required
                                min="0"
                                max="99.99"
                                step="0.01"
                                className="w-full px-6 py-2 bg-neutral-900 border border-neutral-700 rounded-full text-white focus:outline-none focus:border-neutral-500"
                                placeholder=""
                            />
                        </motion.div>

                        <div className="flex gap-3 mt-1">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center rounded-full bg-black text-white h-9 px-8 py-5 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <FaSpinner className="animate-spin mr-2" />
                                    ) : (
                                        <span className="text-lg mr-1">+</span>
                                    )}
                                    <span>{isLoading ? 'Creating...' : 'Create'}</span>
                                </button>
                            </motion.div>
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                exit={{ opacity: 0 }}
                                type="button"
                                onClick={handleCancel}
                                className="h-9 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors"
                            >
                                Cancel
                            </motion.button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}