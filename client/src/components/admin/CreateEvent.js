// src/components/admin/CreateEvent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreateEvent({ formData, handleInputChange, handleSubmit, message }) {
    const [showContractorPopup, setShowContractorPopup] = useState(false);
    const [contractors, setContractors] = useState([]);
    const [selectedContractors, setSelectedContractors] = useState([]);
    // const [selectionType, setSelectionType] = useState('all');

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

    // const handlePopupSelection = (type) => {
    //     setSelectionType(type);
    //     if (type === 'all') {
    //         setSelectedContractors(contractors.map(contractor => contractor._id));
    //     } else {
    //         setSelectedContractors([]);
    //     }
    // };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const updatedFormData = { ...formData, assignedContractors: selectedContractors };
        handleSubmit(updatedFormData);
    };

    return (
        <div className="w-full flex flex-col items-center">
            <h1 className="self-start text-white text-2xl font-semibold mb-8">Event Creation:</h1>
            <form className="space-y-4 w-[60%]" onSubmit={handleFormSubmit}>
                <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                        <label className="block text-white text-sm font-bold mb-2">Event Name <span className="text-red-500">*</span></label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                            type="text"
                            name="eventName"
                            placeholder="Enter Event Name"
                            value={formData.eventName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full md:w-1/2 px-3">
                        <label className="block text-white text-sm font-bold mb-2">Load In <span className="text-red-500">*</span></label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-black/35 leading-tight focus:outline-none"
                            type="datetime-local"
                            name="eventLoadIn"
                            value={formData.eventLoadIn}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="w-full md:w-1/2 px-3">
                        <label className="block text-white text-sm font-bold mb-2">Load Out <span className="text-red-500">*</span></label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-black/35 leading-tight focus:outline-none"
                            type="datetime-local"
                            name="eventLoadOut"
                            value={formData.eventLoadOut}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                    
                    <div className="w-full md:w-1/2 px-3">
                        <label className="block text-white text-sm font-bold mb-2">Total Hours <span className="text-red-500">*</span></label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                            type="number"
                            name="eventHours"
                            placeholder="Enter Total Hours"
                            value={formData.eventHours}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="w-full md:w-1/2 px-3">
                    <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full md:w-1/2 px-3">
                        <label className="block text-white text-sm font-bold mb-2">Contractors <span className="text-red-500">*</span></label>
                        <button type="button" onClick={() => setShowContractorPopup(true)}
                                className="appearance-none border rounded w-max py-2 px-3 mt-0 text-white bg-gray-500 hover:bg-gray-700 leading-tight focus:outline-none">
                            Select Contractors <img src="../images/select.png" alt="Select Icon" className="w-4 h-4 inline-block ml-2" />
                        </button>
                    </div>
                </div>

                {showContractorPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-[80%] max-w-md relative">
                        <h2 className="text-lg font-semibold text-black mb-4 text-center">Select Contractors</h2>
                        <div className="flex justify-center gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setSelectedContractors(contractors.map(contractor => contractor._id))}
                                className="px-4 py-2 rounded-full bg-blue-600 text-white"
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedContractors([])}
                                className="px-4 py-2 rounded-full bg-red-600 text-white"
                            >
                                Deselect All
                            </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto border rounded-md p-3">
                            {contractors.map((contractor) => (
                                <label key={contractor._id} className="block mb-2">
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
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
                
                )}
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full  px-3">
                        <label className="block text-white text-sm font-bold mb-2">Location <span className="text-red-500">*</span></label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                            type="text"
                            name="eventLocation"
                            placeholder="Enter Event Location"
                            value={formData.eventLocation}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                        <label className="block text-white text-sm font-bold mb-2">Job Description <span className="text-red-500">*</span></label>
                        <textarea
                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                            name="eventDescription"
                            placeholder="Enter Job Description"
                            rows="3"
                            value={formData.eventDescription}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
                <div className="flex justify-center">
                    <button
                        className="bg-gray-500 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-full"
                        type="submit"
                    >
                        Create
                    </button>
                </div>
            </form>
            {message && <p className="text-white mt-4">{message}</p>}
        </div>
    );
}
