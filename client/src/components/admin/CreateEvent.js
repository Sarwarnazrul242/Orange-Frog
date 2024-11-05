// src/components/admin/CreateEvent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus } from 'react-icons/fa';

export default function CreateEvent({ formData, handleInputChange, handleSubmit, message }) {
    const [showContractorPopup, setShowContractorPopup] = useState(false);
    const [contractors, setContractors] = useState([]);
    const [selectedContractors, setSelectedContractors] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/users')
            .then((response) => setContractors(response.data.filter(user => user.status === 'active')))
            .catch((error) => console.error('Error fetching contractors:', error));
    }, []);

    const handleContractorChange = (id) => {
        setSelectedContractors(prev => 
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const updatedFormData = { ...formData, assignedContractors: selectedContractors };
        handleSubmit(updatedFormData);
    };

    return (
        <div className="w-full flex flex-col items-center">
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
                            className="appearance-none border rounded w-full py-3 px-4 text-black text-lg leading-tight focus:outline-none"
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
                            className="appearance-none border rounded w-full py-3 px-4 text-black text-lg leading-tight focus:outline-none"
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
                            className="appearance-none border rounded w-max py-1 px-4 text-white bg-gray-500 hover:bg-gray-700 leading-tight focus:outline-none text-lg flex items-center"
                        >
                            Select Contractors <FaUserPlus className="w-5 h-5 inline-block ml-2" />
                        </button>
                    </div>
                </div>

                {showContractorPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-[80%] max-w-md relative">
                            <h2 className="text-xl font-semibold text-black mb-6 text-center">Select Contractors</h2>
                            <div className="flex justify-center gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedContractors(contractors.map(contractor => contractor._id))}
                                    className="px-1 py-1 rounded-full bg-black text-white text-lg"
                                >
                                    Select All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedContractors([])}
                                    className="px-1 py-1 rounded-full bg-black text-white text-lg"
                                >
                                    Deselect All
                                </button>
                            </div>
                            <div className="max-h-48 overflow-y-auto border rounded-md p-4">
                                {contractors.map((contractor) => (
                                    <label key={contractor._id} className="block mb-3 text-lg">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={selectedContractors.includes(contractor._id)}
                                            onChange={() => handleContractorChange(contractor._id)}
                                        />
                                        {contractor.name}
                                    </label>
                                ))}
                            </div>
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
                        className="bg-zinc-950 hover:bg-gray-900 text-white font-bold py-1 px-6 rounded-full text-lg"
                        type="submit"
                    >
                        Create
                    </button>
                </div>
            </form>
            {message && <p className="text-green-600 mt-6 text-lg ">{message}</p>}
        </div>
    );
}
