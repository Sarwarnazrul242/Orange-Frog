// src/components/admin/CreateEvent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus } from 'react-icons/fa';
import MultiSelect from './MultiSelect';
import { toast } from 'sonner';

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
        axios.get('http://localhost:8000/users')
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
            const response = await fetch('http://localhost:8000/create-event', {
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
                toast.success('Event created successfully!'); // Success toast
            } else {
                setMessage(result.message || 'Error creating event');
                toast.error(result.message || 'Error creating event'); // Error toast
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Server error, please try again later');
            toast.error('Server error, please try again later'); // Error toast
        }

        setLoading(false);
    };

    return (
        <div className="w-full flex overflow-y-auto flex-col items-center">
            <h1 className="self-start text-white text-3xl font-semibold mb-10">Event Creation:</h1>
            <form className="space-y-6 w-[70%]" onSubmit={handleFormSubmit}>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block text-white text-lg font-bold mb-2">Event Name <span className="text-red-500">*</span></label>
                        <input
                            className="appearance-none border rounded w-full py-3 px-4 text-black text-lg leading-tight focus:outline-none"
                            type="text"
                            name="eventName"
                            placeholder="Enter Event Name"
                            value={formData.eventName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full md:w-1/2 px-3">
                        <label className="block text-white text-lg font-bold mb-2">Load In <span className="text-red-500">*</span></label>
                        <input
                            className="appearance-none border rounded w-full py-3 px-4 text-black/50 text-lg leading-tight focus:outline-none"
                            type="datetime-local"
                            name="eventLoadIn"
                            value={formData.eventLoadIn}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="w-full md:w-1/2 px-3">
                        <label className="block text-white text-lg font-bold mb-2">Load Out <span className="text-red-500">*</span></label>
                        <input
                            className="appearance-none border rounded w-full py-3 px-4 text-black/50 text-lg leading-tight focus:outline-none"
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
                        <label className="block text-white text-lg font-bold mb-2">Total Hours <span className="text-red-500">*</span></label>
                        <input
                            className="appearance-none border rounded w-full py-3 px-4 text-black text-lg leading-tight focus:outline-none"
                            type="number"
                            name="eventHours"
                            placeholder="Enter Total Hours"
                            value={formData.eventHours}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="w-full md:w-1/2 px-3">
                        <label className="block text-white text-lg font-bold">Contractors </label>
                        <button
                            type="button"
                            onClick={() => setShowContractorPopup(true)}
                            className="appearance-none border rounded w-max py-6 px-4 text-white bg-gray-500 hover:bg-gray-700 leading-tight focus:outline-none text-lg flex items-center justify-center mt-2"
                        >
                            Select Contractors <FaUserPlus className="w-5 h-5 inline-block ml-2" />
                        </button>
                    </div>
                </div>

                {showContractorPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-[80%] max-w-md relative">
                            <h2 className="text-xl font-semibold text-black mb-6 text-center">Select Contractors</h2>
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
                            />
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => setShowContractorPopup(false)}
                                    className="px-1 py-1 bg-black text-white rounded-lg text-lg"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block text-white text-lg font-bold mb-2">Location <span className="text-red-500">*</span></label>
                        <input
                            className="appearance-none border rounded w-full py-3 px-4 text-black text-lg leading-tight focus:outline-none"
                            type="text"
                            name="eventLocation"
                            placeholder="Enter Event Location"
                            value={formData.eventLocation}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block text-white text-lg font-bold mb-2">Job Description </label>
                        <textarea
                            className="appearance-none border rounded w-full py-3 px-4 text-black text-lg leading-tight focus:outline-none"
                            name="eventDescription"
                            placeholder="Enter Job Description"
                            rows="4"
                            value={formData.eventDescription}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="flex justify-center">
                    <button
                        className="bg-zinc-950 hover:bg-gray-900 text-white font-bold py-1 px-6 rounded-full text-lg flex items-center justify-center"
                        type="submit"
                        disabled={loading} // Disable button while loading
                    >
                        {loading ? (
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
                        ) : (
                            'Create'
                        )}
                    </button>
                </div>
            </form>
            {message && <p className="text-green-600 mt-6 text-lg ">{message}</p>}
        </div>
    );
}
