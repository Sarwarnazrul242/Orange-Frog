// src/components/home/MyJobs.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTh, FaList } from 'react-icons/fa';

export default function MyJobs({ userId }) {
    const [viewType, setViewType] = useState("upcoming"); // "upcoming", "completed", or "rejected"
    const [sortOption, setSortOption] = useState("closest");
    const [isGridView, setIsGridView] = useState(false); // Toggle between grid and list view
    const [showViewDropdown, setShowViewDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [jobs, setJobs] = useState({
        upcoming: [],
        completed: [],
        rejected: []
    });

    useEffect(() => {
        if (!userId) return; // Exit if userId is undefined
    
        const fetchUserJobs = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/events/user-jobs/${userId}`);
                const { acceptedJobs, completedJobs, rejectedJobs } = response.data;
    
                setJobs({
                    upcoming: acceptedJobs.map(job => ({ ...job, status: "Processing" })),
                    completed: completedJobs.map(job => ({ ...job, status: "Completed" })),
                    rejected: rejectedJobs.map(job => ({ ...job, status: "Rejected" }))
                });
            } catch (error) {
                console.error("Error fetching user jobs:", error);
            }
        };
    
        fetchUserJobs();
    }, [userId]);
    

    // Determine which jobs to display based on selected view type
    const jobsToShow = viewType === "upcoming" ? jobs.upcoming : viewType === "completed" ? jobs.completed : jobs.rejected;

    // Sort jobs based on the selected option
    const sortedJobs = [...jobsToShow].sort((a, b) => {
        return sortOption === "closest"
            ? new Date(a.eventLoadIn) - new Date(b.eventLoadIn)
            : new Date(b.eventLoadIn) - new Date(a.eventLoadIn);
    });

    return (
        <div className="flex flex-col self-start p-5 w-full overflow-y-scroll ">
            {/* Controls Section */}
            <h1 className="text-2xl text-white">My Jobs</h1>
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
                {sortedJobs.map((job) => (
                    <div key={job._id} className="bg-white p-4 rounded shadow-md text-black border border-gray-300">
                        <h3 className="text-lg font-semibold">{job.eventName}</h3>
                        <p className="text-sm">Location: {job.eventLocation}</p>
                        <p className="text-sm">Load In: {new Date(job.eventLoadIn).toLocaleString()}</p>
                        <p className="text-sm">Load Out: {new Date(job.eventLoadOut).toLocaleString()}</p>
                        <p className="text-sm">Hours: {job.eventHours}</p>
                        <p className="text-sm">Description: {job.eventDescription}</p>
                        <p className="text-sm font-semibold text-yellow-600">Status: {job.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
