import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FaTh, FaList, FaSortAlphaDown, FaSortAlphaUp, FaArrowUp, FaArrowDown, FaRegSadTear, FaTimes } from 'react-icons/fa';
import { AuthContext } from "../../../../AuthContext";
import { Link } from "react-router-dom";
import { toast } from 'sonner';
import Modal from "../../../Modal";
import { HoverEffect } from "../../../ui/card-hover-effect";

export default function FindJobs() {
    const { auth } = useContext(AuthContext);
    const [sortOption, setSortOption] = useState("recent");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [isGridView, setIsGridView] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [jobStatuses, setJobStatuses] = useState({});
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmationType, setConfirmationType] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);


    useEffect(() => {
        const fetchAssignedJobs = async () => {
            try {
                console.log("Fetching jobs for user:", auth.email);
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND}/events/assigned/${auth.email}`
                );
                console.log("Jobs response:", response.data);
                setJobs(response.data);

                // Initialize jobStatuses
                const statuses = {};
                response.data.forEach((job) => {
                    if (job.acceptedContractors.includes(auth.email)) {
                        statuses[job._id] = "Accepted";
                    } else if (job.rejectedContractors.includes(auth.email)) {
                        statuses[job._id] = "Rejected";
                    } else {
                        statuses[job._id] = "";
                    }
                });
                setJobStatuses(statuses);
            } catch (error) {
                console.error("Error fetching assigned jobs:", error);
            }
        };

        if (auth.email) {
            fetchAssignedJobs();
        }
    }, [auth.email]);

    const sortedJobs = [...jobs].sort((a, b) => {
        return sortOption === "recent"
        ? new Date(b.eventLoadIn) - new Date(a.eventLoadIn)
        : new Date(a.eventLoadIn) - new Date(b.eventLoadIn);
    });

    const handleReject = async (id) => {
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND}/events/reject`, {
                eventId: id,
                email: auth.email,
            });
            setJobStatuses((prev) => ({ ...prev, [id]: "Rejected" }));
            setJobs((prevJobs) => prevJobs.filter((job) => job._id !== id));
        } catch (error) {
            console.error("Error rejecting job:", error);
        }
    };

    const handleCardClick = (job) => {
        // No need to setSelectedJob as we're not using a Modal
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortedJobs = () => {
        if (!sortField) return sortedJobs;

        return [...sortedJobs].sort((a, b) => {
            const aValue = a[sortField]?.toString().toLowerCase() || '';
            const bValue = b[sortField]?.toString().toLowerCase() || '';

            if (sortDirection === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
    };

    const handleApply = async (eventId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/events/${eventId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contractorId: auth._id,
                    email: auth.email
                }),
            });

            if (response.ok) {
                setJobs(prevJobs => prevJobs.filter(job => job._id !== eventId));
                toast.success('Successfully applied to event');
            } else {
                toast.error('Failed to apply to event');
            }
        } catch (error) {
            console.error('Error applying to event:', error);
            toast.error('Error applying to event');
        }
    };

    const openConfirmModal = (type, jobId) => {
        setConfirmationType(type);
        setSelectedJobId(jobId);
        setShowConfirmModal(true);
    };

    const handleConfirm = async () => {
        if (confirmationType === 'apply') {
            await handleApply(selectedJobId);
        } else if (confirmationType === 'reject') {
            await handleReject(selectedJobId);
        }
        setShowConfirmModal(false);
    };

    const formatJobsForHoverEffect = (jobs) => {
        return jobs.map((job) => ({
            title: (
                <div>
                    <span>
                        {job.eventName.length > 25
                        ? `${job.eventName.substring(0, 25)}...`
                        : job.eventName}
                    </span>
                </div>
            ),
            description: (
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-zinc-400">Location:</span>
                        <span>
                            {job.eventLocation.length > 25
                            ? `${job.eventLocation.substring(0, 25)}...`
                            : job.eventLocation}
                            </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-zinc-400">Start Date:</span>
                        <span>{new Date(job.eventLoadIn).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-zinc-400">Description:</span>
                        <span className="line-clamp-2">
                            {job.eventDescription.length > 35
                            ? `${job.eventDescription.substring(0, 35)}...`
                            : job.eventDescription}
                        </span>
                    </div>
                    <div className="flex justify-center mt-4 space-x-3">
                        {jobStatuses[job._id] === "" ? (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openConfirmModal('apply', job._id);
                                    }}
                                    className="text-green-500 bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 px-3 py-1.5 rounded-md transition-colors font-semibold whitespace-nowrap"
                                >
                                    ✔ Apply
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openConfirmModal('reject', job._id);
                                    }}
                                    className="text-red-500 bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 px-3 py-1.5 rounded-md transition-colors font-semibold whitespace-nowrap"
                                >
                                    ✖ Reject
                                </button>
                            </>
                        ) : (
                            <span className={`font-semibold ${jobStatuses[job._id] === "Accepted" ? "text-green-600" : "text-red-600"}`}>
                                {jobStatuses[job._id] === "Accepted" ? "✔ Applied" : "✖ Rejected"}
                            </span>
                        )}
                    </div>
                </div>
            ),
            link: '#'
        }));
    };

    return (
        <div className="flex flex-col w-full min-h-screen h-full p-8 bg-gray-100 dark:bg-neutral-900">
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

            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 text-center">
                Posted Jobs
            </h1>
            
            {jobs.length > 0 ? (
                <>
                    {/* Controls Section */}
                    <div className="flex justify-end mb-5 space-x-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className="px-4 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                Sort by
                            </button>
                            {showSortDropdown && (
                                <div className="absolute bg-white dark:bg-neutral-800 shadow-lg rounded-lg mt-2 w-auto border border-neutral-300 dark:border-neutral-700 z-10 -ml-12">
                                    <button
                                        onClick={() => {
                                            setSortOption("recent");
                                            setShowSortDropdown(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        Recent Post
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortOption("closest");
                                            setShowSortDropdown(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        Closest Date
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setIsGridView(true)}
                                className={`p-2 rounded-full border transition-colors ${
                                    isGridView 
                                    ? "bg-neutral-700 dark:bg-neutral-600 text-white border-neutral-600" 
                                    : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700"
                                }`}
                            >
                                <FaTh />
                            </button>
                            <button
                                onClick={() => setIsGridView(false)}
                                className={`p-2 rounded-full border transition-colors ${
                                    !isGridView 
                                    ? "bg-neutral-700 dark:bg-neutral-600 text-white border-neutral-600" 
                                    : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700"
                                }`}
                            >
                                <FaList />
                            </button>
                        </div>
                    </div>

                    {/* Grid View */}
                    {isGridView ? (
                        <div className="w-full">
                            <HoverEffect 
                                items={formatJobsForHoverEffect(sortedJobs)} 
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                            />
                        </div>
                    ) : (
                        <table className="min-w-full bg-white dark:bg-neutral-800 rounded-lg overflow-hidden">
                            <thead className="bg-neutral-100 dark:bg-neutral-700">
                                <tr>
                                    <th className="p-4 text-left text-neutral-900 dark:text-white">
                                        <div className="flex items-center">
                                            Job Name
                                            <span onClick={() => handleSort('eventName')} className="ml-2 cursor-pointer">
                                                {sortField === 'eventName' && sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="p-4 text-left text-neutral-900 dark:text-white">
                                        <div className="flex items-center">
                                            Description
                                            <span onClick={() => handleSort('eventDescription')} className="ml-2 cursor-pointer">
                                                {sortField === 'eventDescription' && sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="p-4 text-left text-neutral-900 dark:text-white">
                                        <div className="flex items-center">
                                            Location
                                            <span onClick={() => handleSort('eventLocation')} className="ml-2 cursor-pointer">
                                                {sortField === 'eventLocation' && sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="p-4 text-left text-neutral-900 dark:text-white">
                                        <div className="flex items-center">
                                            Start Date
                                            <span onClick={() => handleSort('eventLoadIn')} className="ml-2 cursor-pointer">
                                                {sortField === 'eventLoadIn' && sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="p-4 flex flex-col self-center text-neutral-900 dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getSortedJobs().map((job) => (
                                    <tr
                                        key={job._id}
                                        className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
                                        onClick={(e) => {
                                            if (e.target.tagName !== "BUTTON") handleCardClick(job);
                                        }}
                                    >
                                        <td className="p-4 text-neutral-900 dark:text-white truncate">
                                        {job.eventName.length > 25
                                            ? `${job.eventName.substring(0, 25)}...`
                                            : job.eventName}
                                        </td>
                                        <td className="p-4 text-neutral-900 dark:text-white truncate">
                                            {job.eventDescription.length > 50
                                                ? `${job.eventDescription.substring(0, 50)}...`
                                                : job.eventDescription}
                                        </td>
                                        <td className="p-4 text-neutral-900 dark:text-white truncate">
                                            {job.eventLocation.length > 25
                                                ? `${job.eventLocation.substring(0, 25)}...`
                                                : job.eventLocation}
                                        </td>
                                        <td className="p-4 text-neutral-900 dark:text-white truncate">
                                            {new Date(job.eventLoadIn).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                {jobStatuses[job._id] === "" ? (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openConfirmModal('apply', job._id);
                                                            }}
                                                            className="text-green-500 bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 px-3 py-1.5 rounded-md transition-colors font-semibold whitespace-nowrap"
                                                        >
                                                            ✔ Apply
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openConfirmModal('reject', job._id);
                                                            }}
                                                            className="text-red-500 bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 px-3 py-1.5 rounded-md transition-colors font-semibold whitespace-nowrap"
                                                        >
                                                            ✖ Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <p className={`text-lg font-semibold ${jobStatuses[job._id] === "Accepted" ? "text-green-600" : "text-red-600"}`}>
                                                        {jobStatuses[job._id] === "Accepted" ? "✔ Applied" : "✖ Rejected"}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] text-center">
                    <FaRegSadTear className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4" />
                    <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        No Available Jobs
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        There aren't any jobs posted at the moment. Please check back later!
                    </p>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <Modal>
                    <div className="bg-neutral-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6 border-b border-neutral-700">
                            <h3 className="text-xl font-semibold text-white">
                                {confirmationType === 'apply' ? 'Confirm Application' : 'Confirm Rejection'}
                            </h3>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-neutral-300 mb-6">
                                {confirmationType === 'apply' 
                                    ? "By applying to this event, you acknowledge that if approved, you will be required to work this event and cannot reject it later. Are you sure you want to apply?"
                                    : "Once you reject this event, it will be permanently removed from your available jobs. Are you sure you want to reject this event?"
                                }
                            </p>
                            
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        confirmationType === 'apply'
                                            ? 'bg-green-500 hover:bg-green-600 text-white'
                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                    }`}
                                >
                                    {confirmationType === 'apply' ? 'Apply' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
