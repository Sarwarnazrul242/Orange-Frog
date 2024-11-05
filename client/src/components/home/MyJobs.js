// src/components/home/MyJobs.js
import React, { useState } from 'react';
import { FaTh, FaList } from 'react-icons/fa';

export default function MyJobs() {
    const [viewType, setViewType] = useState("upcoming"); // "upcoming", "completed", or "rejected"
    const [sortOption, setSortOption] = useState("closest");
    const [isGridView, setIsGridView] = useState(false); // Toggle between grid and list view
    const [showViewDropdown, setShowViewDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    const upcomingJobs = [
        { jobName: "Job 1", location: "Location A", loadInDate: "2024-11-05", loadInTime: "09:00 AM", loadOutDate: "2024-11-05", loadOutTime: "05:00 PM", hours: 8, description: "Description for Job 1" },
        { jobName: "Job 2", location: "Location B", loadInDate: "2024-11-10", loadInTime: "10:00 AM", loadOutDate: "2024-11-10", loadOutTime: "06:00 PM", hours: 8, description: "Description for Job 2" },
        { jobName: "Job 3", location: "Location B", loadInDate: "2024-11-11", loadInTime: "10:00 AM", loadOutDate: "2024-11-11", loadOutTime: "06:00 PM", hours: 8, description: "Description for Job 2" }
    ];

    const completedJobs = [
        { jobName: "Job 3", location: "Location C", loadInDate: "2024-10-05", loadInTime: "08:00 AM", loadOutDate: "2024-10-05", loadOutTime: "04:00 PM", hours: 8, description: "Description for Job 3" },
        { jobName: "Job 4", location: "Location D", loadInDate: "2024-10-07", loadInTime: "09:00 AM", loadOutDate: "2024-10-07", loadOutTime: "05:00 PM", hours: 8, description: "Description for Job 4" }
    ];

    const rejectedJobs = [
        { jobName: "Job 5", location: "Location E", loadInDate: "2024-09-01", loadInTime: "07:00 AM", loadOutDate: "2024-09-01", loadOutTime: "03:00 PM", hours: 8, description: "Description for Job 5" }
    ];

    // Determine which jobs to display based on selected view type
    const jobsToShow = viewType === "upcoming" ? upcomingJobs : viewType === "completed" ? completedJobs : rejectedJobs;

    // Sort jobs based on the selected option
    const sortedJobs = [...jobsToShow].sort((a, b) => {
        return sortOption === "closest"
            ? new Date(a.loadInDate) - new Date(b.loadInDate)
            : new Date(b.loadInDate) - new Date(a.loadInDate);
    });

    return (
        <div className="p-5 w-full">
            {/* Controls Section */}
            <div className="flex justify-between mb-5">
                {/* View Toggle (Grid/List) */}
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsGridView(false)} className={`p-2 ${!isGridView ? 'bg-gray-500' : 'bg-gray-300'} text-white rounded-full`}>
                        <FaList />
                    </button>
                    <button onClick={() => setIsGridView(true)} className={`p-2 ${isGridView ? 'bg-gray-500' : 'bg-gray-300'} text-white rounded-full`}>
                        <FaTh />
                    </button>
                </div>

                {/* View Type Dropdown and Sort Dropdown */}
                <div className="flex items-center space-x-4">
                    {/* View Type Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowViewDropdown(!showViewDropdown)}
                            className="px-4 py-2 bg-gray-200 rounded-4xl text-black"
                        >
                            {viewType.charAt(0).toUpperCase() + viewType.slice(1)} Jobs
                        </button>
                        {showViewDropdown && (
                            <div className="absolute right-0 bg-white shadow-md rounded mt-2 w-48 border border-gray-300 z-10">
                                <button onClick={() => { setViewType("upcoming"); setShowViewDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Upcoming Jobs</button>
                                <button onClick={() => { setViewType("completed"); setShowViewDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Completed Jobs</button>
                                <button onClick={() => { setViewType("rejected"); setShowViewDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Rejected Jobs</button>
                            </div>
                        )}
                    </div>

                    {/* Sort By Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="px-4 py-2 bg-gray-200 rounded-4xl text-black"
                        >
                            Sort by
                        </button>
                        {showSortDropdown && (
                            <div className="absolute right-0 bg-white shadow-md rounded mt-2 w-48 border border-gray-300 z-10">
                                <button onClick={() => { setSortOption("closest"); setShowSortDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Due Dates Closest</button>
                                <button onClick={() => { setSortOption("farthest"); setShowSortDropdown(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Due Dates Farthest</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Jobs Display Section */}
            <div className={`space-y-4 ${isGridView ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4' : ''}`}>
                {sortedJobs.map((job, index) => (
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
    );
}
