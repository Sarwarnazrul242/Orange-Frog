// src/components/home/MyJobs.js
import React, { useState } from 'react';

export default function MyJobs() {
    const [viewCompleted, setViewCompleted] = useState("Completed");
    const [upcomingSortOption, setUpcomingSortOption] = useState("closest");
    const [completedSortOption, setCompletedSortOption] = useState("closest");
    const [showUpcomingDropdown, setShowUpcomingDropdown] = useState(false);
    const [showCompletedSortDropdown, setShowCompletedSortDropdown] = useState(false);
    const [showCompletedTypeDropdown, setShowCompletedTypeDropdown] = useState(false);

    const upcomingJobs = [
        { jobName: "Job 1", location: "Location A", loadInDate: "2024-11-05", loadInTime: "09:00 AM", loadOutDate: "2024-11-05", loadOutTime: "05:00 PM", hours: 8, description: "Description for Job 1" },
        { jobName: "Job 2", location: "Location B", loadInDate: "2024-11-10", loadInTime: "10:00 AM", loadOutDate: "2024-11-10", loadOutTime: "06:00 PM", hours: 8, description: "Description for Job 2" }
    ];

    const completedJobs = [
        { jobName: "Job 3", location: "Location C", loadInDate: "2024-10-05", loadInTime: "08:00 AM", loadOutDate: "2024-10-05", loadOutTime: "04:00 PM", hours: 8, description: "Description for Job 3" },
        { jobName: "Job 4", location: "Location D", loadInDate: "2024-10-07", loadInTime: "09:00 AM", loadOutDate: "2024-10-07", loadOutTime: "05:00 PM", hours: 8, description: "Description for Job 4" }
    ];

    const rejectedJobs = [
        { jobName: "Job 5", location: "Location E", loadInDate: "2024-09-01", loadInTime: "07:00 AM", loadOutDate: "2024-09-01", loadOutTime: "03:00 PM", hours: 8, description: "Description for Job 5" }
    ];

    // Toggle between Completed and Rejected jobs
    const jobsToShow = viewCompleted === "Completed" ? completedJobs : rejectedJobs;

    // Sort jobs based on selected option
    const sortedUpcomingJobs = [...upcomingJobs].sort((a, b) => {
        return upcomingSortOption === "closest"
            ? new Date(a.loadInDate) - new Date(b.loadInDate)
            : new Date(b.loadInDate) - new Date(a.loadInDate);
    });

    const sortedCompletedJobs = [...jobsToShow].sort((a, b) => {
        return completedSortOption === "closest"
            ? new Date(a.loadInDate) - new Date(b.loadInDate)
            : new Date(b.loadInDate) - new Date(a.loadInDate);
    });

    return (
        <div className="flex gap-10 p-5 w-full border border-gray-300">
            {/* Upcoming Jobs Section */}
            <div className="w-1/2 border border-gray-300 p-5 rounded-lg overflow-y-auto max-h-[600px]">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-2xl font-semibold">Upcoming Jobs</h2>
                    <div className="relative">
                        <button 
                            onClick={() => setShowUpcomingDropdown(!showUpcomingDropdown)} 
                            className="px-4 py-2 bg-gray-200 rounded text-black"
                        >
                            Sort by
                        </button>
                        {showUpcomingDropdown && (
                            <div className="absolute bg-white shadow-md rounded mt-2 w-48 border border-gray-300">
                                <button onClick={() => { setUpcomingSortOption("closest"); setShowUpcomingDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Due Dates Closest</button>
                                <button onClick={() => { setUpcomingSortOption("farthest"); setShowUpcomingDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Due Dates Farthest</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    {sortedUpcomingJobs.map((job, index) => (
                        <div key={index} className="bg-white p-4 rounded shadow-md text-black border border-gray-300">
                            <h3 className="text-lg font-semibold">{job.jobName}</h3>
                            <p className="text-sm">Location: {job.location}</p>
                            <p className="text-sm">Load In: {job.loadInDate} at {job.loadInTime}</p>
                            <p className="text-sm">Load Out: {job.loadOutDate} at {job.loadOutTime}</p>
                            <p className="text-sm">Hours: {job.hours}</p>
                            <p className="text-sm">Description: {job.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Completed/Rejected Jobs Section */}
            <div className="w-1/2 border border-gray-300 p-5 rounded-lg overflow-y-auto max-h-[600px]">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-2xl font-semibold flex items-center">
                        {viewCompleted} Jobs
                        <span
                            onClick={() => setShowCompletedTypeDropdown(!showCompletedTypeDropdown)}
                            className="ml-2 cursor-pointer"
                        >
                            v
                        </span>
                    </h2>
                    {showCompletedTypeDropdown && (
                        <div className="absolute bg-white shadow-md rounded mt-2 w-48 border border-gray-300">
                            <button onClick={() => { setViewCompleted("Completed"); setShowCompletedTypeDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Completed Jobs</button>
                            <button onClick={() => { setViewCompleted("Rejected"); setShowCompletedTypeDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Rejected Jobs</button>
                        </div>
                    )}
                    <div className="relative ml-auto">
                        <button 
                            onClick={() => setShowCompletedSortDropdown(!showCompletedSortDropdown)} 
                            className="px-4 py-2 bg-gray-200 rounded text-black"
                        >
                            Sort by
                        </button>
                        {showCompletedSortDropdown && (
                            <div className="absolute bg-white shadow-md rounded mt-2 w-48 border border-gray-300">
                                <button onClick={() => { setCompletedSortOption("closest"); setShowCompletedSortDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Due Dates Closest</button>
                                <button onClick={() => { setCompletedSortOption("farthest"); setShowCompletedSortDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Due Dates Farthest</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    {sortedCompletedJobs.map((job, index) => (
                        <div key={index} className="bg-white p-4 rounded shadow-md text-black border border-gray-300">
                            <h3 className="text-lg font-semibold">{job.jobName}</h3>
                            <p className="text-sm">Location: {job.location}</p>
                            <p className="text-sm">Load In: {job.loadInDate} at {job.loadInTime}</p>
                            <p className="text-sm">Load Out: {job.loadOutDate} at {job.loadOutTime}</p>
                            <p className="text-sm">Hours: {job.hours}</p>
                            <p className="text-sm">Description: {job.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
