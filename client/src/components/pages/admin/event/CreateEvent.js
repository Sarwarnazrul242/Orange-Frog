// src/components/admin/CreateEvent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus } from 'react-icons/fa';
import MultiSelect from './MultiSelect';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { HoverBorderGradient } from '../../../ui/hover-border-gradient';

export default function CreateEvent() {
    const [formData, setFormData] = useState({
        eventName: '',
        eventLoadIn: '',
        eventLoadOut: '',
        eventLocation: '',
        eventDescription: '',
        eventHours: '',
        assignedContractors: []
    });
    const [showContractorPopup, setShowContractorPopup] = useState(false);
    const [contractors, setContractors] = useState([]);
    const [selectedContractors, setSelectedContractors] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND}/users`)
            .then(response => setContractors(response.data.filter(user => user.status === 'active')))
            .catch(error => console.error('Error fetching contractors:', error));
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContractorChange = (selectedOptions) => {
        setSelectedContractors(selectedOptions.map(option => option.value));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const updatedFormData = { ...formData, assignedContractors: selectedContractors };
        
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/create-event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFormData),
            });
            const result = await response.json();

            if (response.ok) {
                setMessage('Event created successfully!');
                setFormData({
                    eventName: '',
                    eventLoadIn: '',
                    eventLoadOut: '',
                    eventLocation: '',
                    eventDescription: '',
                    eventHours: '',
                    assignedContractors: []
                });
                setSelectedContractors([]);
                toast.success('Event created successfully!');
            } else {
                setMessage(result.message || 'Error creating event');
                toast.error(result.message || 'Error creating event');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Server error, please try again later');
            toast.error('Server error, please try again later');
        }

        setLoading(false);
    };

    return (
        <div className="w-full h-full overflow-auto flex flex-col p-8 bg-neutral-900">
            <Link 
                to="/admin/manage-events"
                className="mb-8 flex items-center text-neutral-400 hover:text-white transition-colors"
            >
                <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path d="M15 19l-7-7 7-7" />
                </svg>
                Return to Manage Events
            </Link>

            <div className="flex flex-col items-center w-full">
                <div className="w-full max-w-3xl">
                    <h1 className="text-white text-2xl mb-10">Create New Event</h1>
                    <div className="w-full max-w-3xl border border-neutral-700 rounded-lg p-8 bg-neutral-800/50 backdrop-blur-sm shadow-lg">
                        <form className="space-y-6" onSubmit={handleFormSubmit}>
                            <div className="flex flex-wrap -mx-3 mb-6">
                                <div className="w-full px-3">
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Event Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="appearance-none border border-neutral-600 rounded w-full py-3 px-4 bg-neutral-700 text-white text-lg leading-tight focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                                        type="text"
                                        name="eventName"
                                        placeholder="Enter Event Name"
                                        value={formData.eventName}
                                        onChange={handleInputChange}
                                        maxLength={100}
                                        required
                                    />
                                    <p className="text-sm text-neutral-400 mt-1">
                                        {formData.eventName.length}/100 characters
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap -mx-3 mb-6">
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Load In <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="appearance-none border border-neutral-600 rounded w-full py-3 px-4 bg-neutral-700 text-white text-lg leading-tight focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                                        type="datetime-local"
                                        name="eventLoadIn"
                                        value={formData.eventLoadIn}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Load Out <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="appearance-none border border-neutral-600 rounded w-full py-3 px-4 bg-neutral-700 text-white text-lg leading-tight focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                                        type="datetime-local"
                                        name="eventLoadOut"
                                        value={formData.eventLoadOut}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap -mx-3 mb-6">
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Total Hours <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="appearance-none border border-neutral-600 rounded w-full py-3 px-4 bg-neutral-700 text-white text-lg leading-tight focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                                        type="number"
                                        name="eventHours"
                                        placeholder="Enter Total Hours"
                                        value={formData.eventHours}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="168" // Maximum hours in a week
                                        required
                                    />
                                    <p className="text-sm text-neutral-400 mt-1">
                                        Maximum: 168 hours (1 week)
                                    </p>
                                </div>
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Contractors
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowContractorPopup(true)}
                                        className="appearance-none border border-neutral-600 rounded py-3 px-4 text-white bg-neutral-700 hover:bg-neutral-600 leading-tight focus:outline-none focus:border-neutral-400 text-lg flex items-center justify-center transition-colors"
                                    >
                                        Select Contractors <FaUserPlus className="w-5 h-5 inline-block ml-2" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap -mx-3 mb-6">
                                <div className="w-full px-3">
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="appearance-none border border-neutral-600 rounded w-full py-3 px-4 bg-neutral-700 text-white text-lg leading-tight focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                                        type="text"
                                        name="eventLocation"
                                        placeholder="Enter Event Location"
                                        value={formData.eventLocation}
                                        onChange={handleInputChange}
                                        maxLength={200}
                                        required
                                    />
                                    <p className="text-sm text-neutral-400 mt-1">
                                        {formData.eventLocation.length}/200 characters
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap -mx-3 mb-6">
                                <div className="w-full px-3">
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Job Description
                                    </label>
                                    <textarea
                                        className="appearance-none border border-neutral-600 rounded w-full py-3 px-4 bg-neutral-700 text-white text-lg leading-tight focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                                        name="eventDescription"
                                        placeholder="Enter Job Description"
                                        rows="4"
                                        value={formData.eventDescription}
                                        onChange={handleInputChange}
                                        maxLength={1000}
                                    />
                                    <p className="text-sm text-neutral-400 mt-1">
                                        {formData.eventDescription.length}/1000 characters
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <HoverBorderGradient
                                    containerClassName="rounded-full"
                                    className="dark:bg-black bg-neutral-900 text-white flex items-center space-x-2 px-8 py-2"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <svg
                                                className="animate-spin h-5 w-5 text-white mr-2"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v8z"
                                                ></path>
                                            </svg>
                                            <span>Creating...</span>
                                        </div>
                                    ) : (
                                        'Create Event'
                                    )}
                                </HoverBorderGradient>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {message && <p className="text-green-500 mt-6 text-lg">{message}</p>}
            {showContractorPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-neutral-900 p-8 rounded-lg shadow-lg w-[80%] max-w-md relative border border-neutral-700">
                        <h2 className="text-xl font-semibold text-white mb-6 text-center">Select Contractors</h2>
                        <MultiSelect
                            options={contractors.map(contractor => ({
                                value: contractor._id,
                                label: contractor.name
                            }))}
                            value={selectedContractors.map(id => ({
                                value: id,
                                label: contractors.find(contractor => contractor._id === id)?.name
                            }))}
                            onChange={handleContractorChange}
                            isMulti
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            className="text-neutral-900"
                        />
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setShowContractorPopup(false)}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-lg transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
