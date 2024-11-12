// src/components/home/IncidentReport.js
import React from 'react';

export default function IncidentReport() {
    return (
        <form className="w-full max-w-2xl grid grid-cols-2 gap-8 mt-52 mb-10">
            <div className="col-span-2">
            <label className="block text-white mb-2">Event Name</label>
                <input
                    type="text"
                    name="name"
                    value=""
                    className="w-full p-3 border rounded-md"
                    required
                />
            </div>

            <div className="col-span-1">
                <label className="block text-white mb-2">Start Date</label>
                <input
                    type="date"
                    name="name"
                    value=""
                    className="w-full p-3 border rounded-md"
                    required
                />
            </div>

            <div className="col-span-1">
                <label className="block text-white mb-2">End Date</label>
                <input
                    type="date"
                    name="name"
                    value=""
                    className="w-full p-3 border rounded-md"
                    required
                />
            </div>

            <div className="col-span-1">
                <label className="block text-white mb-2">Kind of Request</label>
                <input
                    type="text"
                    name="name"
                    value=""
                    className="w-full p-3 border rounded-md"
                />
            </div>

            <div className="col-span-1">
                {/* <label className="block text-white mb-2">Upload Files</label> */}
                <p className="block text-white mb-2">Select Files Here:</p>
                <input
                    type="file"
                    name="name"
                    value=""
                    className="w-full p-3 border rounded-md text-white"
                />
            </div>

            <div className="col-span-2">
            <label className="block text-white mb-2">Incident Description</label>
                <textarea
                    name="name"
                    value=""
                    cols="10"
                    className="w-full p-3 border rounded-md"
                    required
                />
            </div>

            <div className="col-span-2 flex justify-center mt-4">
                <button
                    type="submit"
                    className="bg-zinc-900 hover:bg-black text-white px-4 py-2 rounded-full transition duration-300 ease-in-out"
                >
                    Submit Report
                </button>
            </div>
        </form>
    );
}
