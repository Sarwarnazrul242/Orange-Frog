import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { FaTh, FaList, FaRegSadTear } from 'react-icons/fa';
import { HoverEffect } from "../../../ui/card-hover-effect";
import { motion } from "framer-motion";

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
            className="w-16 h-16 border-4 border-neutral-600 border-t-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="mt-4 text-neutral-400">Loading jobs...</p>
    </div>
);

const CurrentJobs = () => {
    const { auth } = useContext(AuthContext);
    const [currentJobs, setCurrentJobs] = useState([]);
    const [isGridView, setIsGridView] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const fetchJobs = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/events/contractor/${auth.email}`);
            if (response.ok) {
                const data = await response.json();
                
                // Filter jobs based on status and dates
                const currentDate = new Date();
                const filteredJobs = data.filter(job => {
                    const loadInDate = new Date(job.eventLoadIn);
                    const deniedDate = job.deniedAt ? new Date(job.deniedAt) : null;

                    if (job.status === 'approved') {
                        return true;
                    }
                    else if (job.status === 'applied') {
                        return currentDate < loadInDate;
                    }
                    else if (job.status === 'denied' && deniedDate) {
                        const hoursSinceDenied = (currentDate - deniedDate) / (1000 * 60 * 60);
                        return hoursSinceDenied < 24;
                    }
                    return false;
                });

                setCurrentJobs(filteredJobs);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
            toast.error("Error fetching jobs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (auth.email) {
            fetchJobs();
            // Refresh every minute to handle expired jobs
            const interval = setInterval(fetchJobs, 60000);
            return () => clearInterval(interval);
        }
    }, [auth.email]);

    const getStatusBadge = (status) => {
        const badges = {
            applied: "bg-yellow-500/10 text-yellow-500",
            approved: "bg-green-500/10 text-green-500",
            denied: "bg-red-500/10 text-red-500"
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs ${badges[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatJobsForHoverEffect = (jobs) => {
        return jobs.map((job) => ({
            title: (
                <div className="flex justify-between items-center">
                    <span>{job.eventName}</span>
                    {getStatusBadge(job.status)}
                </div>
            ),
            description: (
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-zinc-400">Location:</span>
                        <span>{job.eventLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-zinc-400">Load In:</span>
                        <span>{new Date(job.eventLoadIn).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-zinc-400">Load Out:</span>
                        <span>{new Date(job.eventLoadOut).toLocaleString()}</span>
                    </div>
                </div>
            ),
            link: '#'
        }));
    };

    return (
        <div className="flex flex-col w-full  min-h-screen h-full p-8 bg-neutral-900">
            <Link 
                to="/user/dashboard"
                className="mb-8 flex items-center text-neutral-400 hover:text-white transition-colors"
            >
                <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path d="M15 19l-7-7 7-7" />
                </svg>
                Return to Dashboard
            </Link>

            <div className="flex justify-between items-center mb-6">
                <div className="w-24"> {/* Spacer div */}</div>
                <h1 className="text-3xl font-bold text-white text-center">Current Jobs</h1>
                <div className="flex space-x-2 items-center w-24"> {/* Fixed width to match left spacer */}
                    <button
                        onClick={() => setIsGridView(false)}
                        className={`hidden md:flex px-3 py-0 md:px-4 md:py-2 ${
                            !isGridView ? 'bg-white/20' : 'bg-white/10'
                        } text-white rounded-l-full items-center hover:bg-white/30 transition-colors`}
                    >
                        <FaList className="mr-1 text-base md:text-xl" />
                    </button>
                    <button
                        onClick={() => setIsGridView(true)}
                        className={`hidden md:flex px-3 py-0 md:px-4 md:py-2 ${
                            isGridView ? 'bg-white/20' : 'bg-white/10'
                        } text-white rounded-r-full items-center hover:bg-white/30 transition-colors`}
                    >
                        <FaTh className="mr-1 text-base md:text-xl" />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : currentJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] text-center">
                    <FaRegSadTear className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4" />
                    <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        No Current Jobs
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        You don't have any active jobs at the moment. Check the Find Jobs page for new opportunities!
                    </p>
                    <Link 
                        to="/user/find-jobs"
                        className="mt-6 px-6 py-2 bg-blue-500/10 text-blue-400 rounded-full hover:bg-blue-500/20 transition-colors"
                    >
                        Find New Jobs
                    </Link>
                </div>
            ) : (
                <>
                    {isGridView ? (
                        <div className="w-full">
                            <HoverEffect 
                                items={formatJobsForHoverEffect(currentJobs)} 
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-neutral-800 rounded-lg overflow-hidden">
                                <thead className="bg-neutral-700">
                                    <tr>
                                        <th className="p-4 text-left text-white">Event Name</th>
                                        <th className="p-4 text-left text-white">Location</th>
                                        <th className="p-4 text-left text-white">Load In</th>
                                        <th className="p-4 text-left text-white">Load Out</th>
                                        <th className="p-4 text-left text-white">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentJobs.map((job) => (
                                        <tr key={job._id} className="border-t border-neutral-700 hover:bg-neutral-700/50 transition-colors">
                                            <td className="p-4 text-white">{job.eventName}</td>
                                            <td className="p-4 text-white">{job.eventLocation}</td>
                                            <td className="p-4 text-white">{new Date(job.eventLoadIn).toLocaleString()}</td>
                                            <td className="p-4 text-white">{new Date(job.eventLoadOut).toLocaleString()}</td>
                                            <td className="p-4">{getStatusBadge(job.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CurrentJobs;
