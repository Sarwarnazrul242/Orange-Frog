// src/components/home/JobBook.js
import React, { useState } from 'react';

export default function JobBook() {
    const [sortOption, setSortOption] = useState("recent");
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Demo job data
    const jobs = [
        { id: 1, jobName: "Job 1", location: "Location A", loadInDate: "2024-11-05", loadInTime: "09:00 AM", loadOutDate: "2024-11-05", loadOutTime: "05:00 PM", hours: 8, description: "Description for Job 1", status: "" },
        { id: 2, jobName: "Job 2", location: "Location B", loadInDate: "2024-11-10", loadInTime: "10:00 AM", loadOutDate: "2024-11-10", loadOutTime: "06:00 PM", hours: 8, description: "Description for Job 2", status: "" },
        { id: 3, jobName: "Job 3", location: "Location C", loadInDate: "2024-11-07", loadInTime: "08:00 AM", loadOutDate: "2024-11-07", loadOutTime: "04:00 PM", hours: 8, description: "Description for Job 3", status: "" },
    ];

    const [jobStatuses, setJobStatuses] = useState(
        jobs.reduce((acc, job) => {
            acc[job.id] = job.status; // Initialize each job's status as an empty string
            return acc;
        }, {})
    );

    // Sort jobs based on selected option
    const sortedJobs = [...jobs].sort((a, b) => {
        if (sortOption === "recent") {
            return new Date(b.loadInDate) - new Date(a.loadInDate); // Sort by most recent post
        } else {
            return new Date(a.loadInDate) - new Date(b.loadInDate); // Sort by closest date
        }
    });

    // Handle accept and reject actions
    const handleAccept = (id) => {
        setJobStatuses((prev) => ({ ...prev, [id]: "Accepted" }));
    };

    const handleReject = (id) => {
        setJobStatuses((prev) => ({ ...prev, [id]: "Rejected" }));
    };

    return (
        <div className="p-5 w-full">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-semibold">Job Posted</h2>
                <div className="relative">
                    <button 
                        onClick={() => setShowSortDropdown(!showSortDropdown)} 
                        className="px-4 py-2 bg-gray-200 rounded-4xl text-black"
                    >
                        Sort by
                    </button>
                    {showSortDropdown && (
                        <div className="absolute bg-white shadow-md rounded mt-2 w-48 border border-gray-300">
                            <button onClick={() => { setSortOption("recent"); setShowSortDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Recent Post</button>
                            <button onClick={() => { setSortOption("closest"); setShowSortDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Closest Date</button>
                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedJobs.map((job) => (
                    <div key={job.id} className="bg-white p-4 rounded shadow-md text-black border border-gray-300 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">{job.jobName}</h3>
                            <p className="text-sm">Location: {job.location}</p>
                            <p className="text-sm">Load In: {job.loadInDate} at {job.loadInTime}</p>
                            <p className="text-sm">Load Out: {job.loadOutDate} at {job.loadOutTime}</p>
                            <p className="text-sm">Hours: {job.hours}</p>
                            <p className="text-sm">Description: {job.description}</p>
                        </div>
                        <div className="flex justify-between mt-4">
                            {jobStatuses[job.id] === "" ? (
                                <>
                                    <button onClick={() => handleAccept(job.id)} className="text-green-600 hover:bg-gray-200 font-semibold">✔ Accept</button>
                                    <button onClick={() => handleReject(job.id)} className="text-red-600 hover:bg-gray-200 font-semibold">✖ Reject</button>
                                </>
                            ) : (
                                <p className={`text-lg font-semibold ${jobStatuses[job.id] === "Accepted" ? "text-green-600" : "text-red-600"}`}>
                                    {jobStatuses[job.id] === "Accepted" ? "✔ Accepted" : "✖ Rejected"}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
