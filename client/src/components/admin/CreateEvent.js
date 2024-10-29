// src/components/admin/CreateEvent.js
import React from 'react';

export default function CreateEvent({ formData, handleInputChange, handleSubmit, message }) {
    return (
        <div className="w-full flex flex-col items-center">
            <h1 className="self-start text-white text-2xl font-semibold mb-8">Event Creation:</h1>
            <form className="space-y-4 w-[60%]" onSubmit={handleSubmit}>
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
                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
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
                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
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
                    <div className="w-full md:w-1/2 px-3">
                        <label className="block text-white text-sm font-bold mb-2">Total Hours</label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                            type="number"
                            name="eventHours"
                            placeholder="Enter Total Hours"
                            value={formData.eventHours}
                            onChange={handleInputChange}
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
                        className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-full"
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
