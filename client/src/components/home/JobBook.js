import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function JobBook({ userId }) {
    const [sortOption, setSortOption] = useState("recent");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [jobStatuses, setJobStatuses] = useState({});

    useEffect(() => {
        if (!userId) return;
    
        const fetchAssignedJobs = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/events/assigned/${userId}`);
                const jobs = response.data;
                setJobs(jobs);
    
                // Initialize jobStatuses based on user's existing accept/reject status
                const statuses = {};
                jobs.forEach(job => {
                    if (job.acceptedContractors.includes(userId)) {
                        statuses[job._id] = "Accepted";
                    } else if (job.rejectedContractors.includes(userId)) {
                        statuses[job._id] = "Rejected";
                    } else {
                        statuses[job._id] = ""; // No status if not accepted/rejected yet
                    }
                });
                setJobStatuses(statuses);
            } catch (error) {
                console.error('Error fetching assigned jobs:', error);
            }
        };
    
        fetchAssignedJobs();
    }, [userId]);

    const sortedJobs = [...jobs].sort((a, b) => {
        if (sortOption === "recent") {
            return new Date(b.eventLoadIn) - new Date(a.eventLoadIn);
        } else {
            return new Date(a.eventLoadIn) - new Date(b.eventLoadIn);
        }
    });


    const handleAccept = async (id) => {
        try {
            await axios.post('http://localhost:8000/events/accept', { eventId: id, userId });
            setJobStatuses((prev) => ({ ...prev, [id]: "Accepted" }));
            
            setJobs((prevJobs) => prevJobs.filter(job => job._id !== id));
        } catch (error) {
            console.error('Error accepting job:', error);
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.post('http://localhost:8000/events/reject', { eventId: id, userId });
            setJobStatuses((prev) => ({ ...prev, [id]: "Rejected" }));

            setJobs((prevJobs) => prevJobs.filter(job => job._id !== id));
        } catch (error) {
            console.error('Error rejecting job:', error);
        }
    };


    return (
        <div className="flex flex-col self-start p-5 w-full"> 
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl text-white">Posted Jobs</h1>
                <div className="relative">
                    <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="px-4 py-2 bg-gray-200 rounded-4xl text-black">
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
                    <div key={job._id} className="bg-white p-4 rounded shadow-md text-black border border-gray-300 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">{job.eventName}</h3>
                            <p className="text-sm">Location: {job.eventLocation}</p>
                            <p className="text-sm">Load In: {new Date(job.eventLoadIn).toLocaleString()}</p>
                            <p className="text-sm">Load Out: {new Date(job.eventLoadOut).toLocaleString()}</p>
                            <p className="text-sm">Hours: {job.eventHours}</p>
                            <p className="text-sm">Description: {job.eventDescription}</p>
                        </div>
                        <div className="flex justify-between mt-4">
                            {jobStatuses[job._id] === "" ? (
                                <>
                                    <button onClick={() => handleAccept(job._id)} className="text-green-600 hover:bg-gray-200 font-semibold">✔ Accept</button>
                                    <button onClick={() => handleReject(job._id)} className="text-red-600 hover:bg-gray-200 font-semibold">✖ Reject</button>
                                </>
                            ) : (
                                <p className={`text-lg font-semibold ${jobStatuses[job._id] === "Accepted" ? "text-green-600" : "text-red-600"}`}>
                                    {jobStatuses[job._id] === "Accepted" ? "✔ Accepted" : "✖ Rejected"}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
