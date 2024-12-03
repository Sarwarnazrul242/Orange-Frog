import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { FaTh, FaList, FaRegSadTear, FaSort, FaSearch, FaFilter } from 'react-icons/fa';
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
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('future');
    const [showFilters, setShowFilters] = useState(false);

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
                    <span className="text-lg font-semibold">{job.eventName}</span>
                    {getStatusBadge(job.status)}
                </div>
            ),
            description: (
                <div className="flex flex-col space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-neutral-400 font-medium">Load In</p>
                            <div className="pl-2 border-l-2 border-neutral-700">
                                <p className="text-white">{new Date(job.eventLoadIn).toLocaleString()}</p>
                                <p className="text-neutral-300">Hours: {job.eventLoadInHours}h</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-neutral-400 font-medium">Load Out</p>
                            <div className="pl-2 border-l-2 border-neutral-700">
                                <p className="text-white">{new Date(job.eventLoadOut).toLocaleString()}</p>
                                <p className="text-neutral-300">Hours: {job.eventLoadOutHours}h</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-neutral-400 font-medium">Location</p>
                        <p className="text-white">{job.eventLocation}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-neutral-400 font-medium">Description</p>
                        <p className="text-white line-clamp-3">{job.eventDescription}</p>
                    </div>
                </div>
            ),
            link: '#'
        }));
    };

    const sortJobs = (jobs, sortConfig) => {
        if (!sortConfig.key) return jobs;

        return [...jobs].sort((a, b) => {
            if (sortConfig.key === 'eventName') {
                return sortConfig.direction === 'ascending' 
                    ? a.eventName.localeCompare(b.eventName)
                    : b.eventName.localeCompare(a.eventName);
            }
            if (sortConfig.key === 'eventLoadIn' || sortConfig.key === 'eventLoadOut') {
                const dateA = new Date(a[sortConfig.key]);
                const dateB = new Date(b[sortConfig.key]);
                return sortConfig.direction === 'ascending' 
                    ? dateA - dateB 
                    : dateB - dateA;
            }
            return 0;
        });
    };

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'ascending' 
                ? 'descending' 
                : 'ascending'
        }));
    };

    const filteredAndSortedJobs = React.useMemo(() => {
        let filtered = currentJobs;
        const currentDate = new Date();

        // Apply time filter
        if (timeFilter !== 'all') {
            filtered = filtered.filter(job => {
                const loadOutDate = new Date(job.eventLoadOut);
                if (timeFilter === 'future') {
                    return loadOutDate >= currentDate;
                } else if (timeFilter === 'past') {
                    return loadOutDate < currentDate;
                }
                return true;
            });
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(job => 
                job.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.eventLocation.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(job => job.status === statusFilter);
        }

        // Apply sorting
        return sortJobs(filtered, sortConfig);
    }, [currentJobs, searchTerm, statusFilter, timeFilter, sortConfig]);

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return (
                <FaSort className={`ml-1 inline-block transition-transform duration-200 ${
                    sortConfig.direction === 'ascending' ? 'rotate-0' : 'rotate-180'
                }`} />
            );
        }
        return <FaSort className="ml-1 inline-block text-neutral-600" />;
    };

    return (
        <div className="flex flex-col w-full min-h-screen h-full p-8 bg-neutral-900">
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

            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative mt-5">
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 bg-neutral-800 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 bg-neutral-800 rounded-lg text-white hover:bg-neutral-700 transition-colors flex items-center gap-2"
                    >
                        <FaFilter />
                        Filters
                    </button>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsGridView(false)}
                        className={`px-4 py-2 ${
                            !isGridView ? 'bg-white/20' : 'bg-white/10'
                        } text-white rounded-l-lg hover:bg-white/30 transition-colors flex items-center gap-2`}
                    >
                        <FaList />
                        List
                    </button>
                    <button
                        onClick={() => setIsGridView(true)}
                        className={`px-4 py-2 ${
                            isGridView ? 'bg-white/20' : 'bg-white/10'
                        } text-white rounded-r-lg hover:bg-white/30 transition-colors flex items-center gap-2`}
                    >
                        <FaTh />
                        Grid
                    </button>
                </div>
            </div>

            {showFilters && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6 p-4 bg-neutral-800 rounded-lg"
                >
                    <div className="flex flex-wrap gap-4">
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="px-4 py-2 bg-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="future">Future Events</option>
                            <option value="all">All Events</option>
                            <option value="past">Past Events</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="applied">Applied</option>
                            <option value="approved">Approved</option>
                            <option value="denied">Denied</option>
                        </select>
                    </div>
                </motion.div>
            )}

            <div className="mb-4 text-sm text-neutral-400">
                Showing {timeFilter === 'future' ? 'upcoming' : timeFilter === 'past' ? 'past' : 'all'} events
                {statusFilter !== 'all' && ` • ${statusFilter} status`}
                {searchTerm && ` • Search: "${searchTerm}"`}
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : filteredAndSortedJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] text-center">
                    <FaRegSadTear className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4" />
                    <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        No Events Found
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        {timeFilter === 'future' 
                            ? "You don't have any upcoming events."
                            : timeFilter === 'past'
                            ? "No past events found."
                            : "No events match your current filters."}
                    </p>
                    {timeFilter !== 'future' && (
                        <button 
                            onClick={() => setTimeFilter('future')}
                            className="mt-4 px-4 py-2 bg-neutral-800 rounded-lg text-white hover:bg-neutral-700 transition-colors"
                        >
                            Show Future Events
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {isGridView ? (
                        <div className="w-full">
                            <HoverEffect 
                                items={formatJobsForHoverEffect(filteredAndSortedJobs)} 
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-neutral-800">
                            <table className="min-w-full divide-y divide-neutral-800">
                                <thead className="bg-neutral-800/50">
                                    <tr>
                                        <th 
                                            scope="col" 
                                            className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 cursor-pointer"
                                            onClick={() => handleSort('eventName')}
                                        >
                                            Event Name {getSortIcon('eventName')}
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-neutral-300">
                                            Location
                                        </th>
                                        <th 
                                            scope="col" 
                                            className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 cursor-pointer"
                                            onClick={() => handleSort('eventLoadIn')}
                                        >
                                            Load In {getSortIcon('eventLoadIn')}
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-neutral-300">
                                            Load In Hours
                                        </th>
                                        <th 
                                            scope="col" 
                                            className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 cursor-pointer"
                                            onClick={() => handleSort('eventLoadOut')}
                                        >
                                            Load Out {getSortIcon('eventLoadOut')}
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-neutral-300">
                                            Load Out Hours
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-neutral-300">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800 bg-neutral-900">
                                    {filteredAndSortedJobs.map((job) => (
                                        <tr 
                                            key={job._id} 
                                            className="hover:bg-neutral-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                                                {job.eventName.length > 25
                                                    ? `${job.eventName.substring(0, 25)}...`
                                                    : job.eventName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                                                {job.eventLocation.length > 25
                                                    ? `${job.eventLocation.substring(0, 25)}...`
                                                    : job.eventLocation}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                                                <div className="flex flex-col">
                                                    <span>{new Date(job.eventLoadIn).toLocaleDateString()}</span>
                                                    <span className="text-neutral-500">
                                                        {new Date(job.eventLoadIn).toLocaleTimeString([], { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                                                {job.eventLoadInHours}h
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                                                <div className="flex flex-col">
                                                    <span>{new Date(job.eventLoadOut).toLocaleDateString()}</span>
                                                    <span className="text-neutral-500">
                                                        {new Date(job.eventLoadOut).toLocaleTimeString([], { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                                                {job.eventLoadOutHours}h
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(job.status)}
                                            </td>
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
