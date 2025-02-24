import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FaTh, FaList, FaRegSadTear, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { AuthContext } from "../../../../AuthContext";
import { Link } from "react-router-dom";
import { toast } from 'sonner';
import Modal from "../../../Modal";
import { HoverEffect } from "../../../ui/card-hover-effect";
import { AnimatePresence, motion } from 'framer-motion';

export default function FindJobs() {
    const { auth } = useContext(AuthContext);
    const [isGridView, setIsGridView] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [jobStatuses, setJobStatuses] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmationType, setConfirmationType] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [nameFilter, setNameFilter] = useState("");
    const [showSortOptions, setShowSortOptions] = useState(false);
    const [animateSortOptions, setAnimateSortOptions] = useState(false);

    useEffect(() => {
        const fetchAssignedJobs = async () => {
            try {
                console.log("Fetching jobs for user:", auth.email);
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND}/events/assigned/${auth.email}`
                );
                console.log("Jobs response:", response.data);
                
                const currentDate = new Date();
                const futureJobs = response.data.filter(job => {
                    const loadInDate = new Date(job.eventLoadIn);
                    return loadInDate >= currentDate;
                });

                setJobs(futureJobs);

                const statuses = {};
                futureJobs.forEach((job) => {
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
                toast.error("Failed to fetch available jobs");
            }
        };

        if (auth.email) {
            fetchAssignedJobs();
        }
    }, [auth.email]);

    const handleSort = (key) => {
        setSortConfig(prevConfig => {
            const direction = prevConfig.key === key && prevConfig.direction === 'ascending'
                ? 'descending'
                : 'ascending';
            return { key, direction };
        });
    };

    const toggleSortOptions = () => {
        setShowSortOptions((prev) => !prev);
        setAnimateSortOptions(true);
    };

    const cancelSortOptions = () => {
        setAnimateSortOptions(false);
        setShowSortOptions(false);
    };

    const sortedJobs = React.useMemo(() => {
        let sortedArray = [...jobs];
        if (sortConfig.key) {
            sortedArray.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (typeof aVal === 'string') {
                    return sortConfig.direction === 'ascending'
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                }
                if (typeof aVal === 'number' || aVal instanceof Date) {
                    return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
                }
                return 0;
            });
        }
        return sortedArray;
    }, [jobs, sortConfig]);

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    };

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
                  <span className="text-lg font-semibold">{job.eventName}</span>
                  <span>
                      {job.eventName.length > 25
                          ? `${job.eventName.substring(0, 25)}...`
                          : job.eventName}
                  </span>
              </div>
          ),
          description: (
              <div className="flex flex-col space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      {/* Load In Section */}
                      <div className="space-y-2">
                          <p className="text-neutral-400 font-medium">Load In</p>
                          <div className="pl-2 border-l-2 border-neutral-700">
                              <p className="text-white">
                                  {new Date(job.eventLoadIn).toLocaleString()}
                              </p>
                              <p className="text-neutral-300">
                                  Hours: {job.eventLoadInHours}h
                              </p>
                          </div>
                      </div>
  
                      {/* Load Out Section */}
                      <div className="space-y-2">
                          <p className="text-neutral-400 font-medium">Load Out</p>
                          <div className="pl-2 border-l-2 border-neutral-700">
                              <p className="text-white">
                                  {new Date(job.eventLoadOut).toLocaleString()}
                              </p>
                              <p className="text-neutral-300">
                                  Hours: {job.eventLoadOutHours}h
                              </p>
                          </div>
                      </div>
                  </div>
  
                  {/* Location Section */}
                  <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                          <span className="text-zinc-400">Location:</span>
                          <span>
                              {job.eventLocation.length > 25
                                  ? `${job.eventLocation.substring(0, 25)}...`
                                  : job.eventLocation}
                          </span>
                      </div>
                      <div className="space-y-2">
                          <p className="text-neutral-400 font-medium">Location</p>
                          <p className="text-white">{job.eventLocation}</p>
                      </div>
                  </div>
  
                  {/* Description Section */}
                  <div className="space-y-2">
                      <p className="text-neutral-400 font-medium">Description</p>
                      <p className="text-white line-clamp-3">{job.eventDescription}</p>
                  </div>
  
                  {/* Action Buttons */}
                  <div className="flex justify-center mt-4 space-x-3">
                      {jobStatuses[job._id] === "" ? (
                          <>
                              <button
                                  onClick={(e) => {
                                      e.preventDefault();
                                      openConfirmModal('apply', job._id);
                                  }}
                                  className="text-green-500 bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-md transition-colors font-semibold whitespace-nowrap"
                              >
                                  ✔ Apply
                              </button>
                              <button
                                  onClick={(e) => {
                                      e.preventDefault();
                                      openConfirmModal('reject', job._id);
                                  }}
                                  className="text-red-500 bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-md transition-colors font-semibold whitespace-nowrap"
                              >
                                  ✖ Reject
                              </button>
                          </>
                      ) : (
                          <span
                              className={`font-semibold ${
                                  jobStatuses[job._id] === "Accepted"
                                      ? "text-green-600"
                                      : "text-red-600"
                              }`}
                          >
                              {jobStatuses[job._id] === "Accepted"
                                  ? "✔ Applied"
                                  : "✖ Rejected"}
                          </span>
                      )}
                  </div>
              </div>
          ),
          link: "#",
      }));
  };
  

  const getFilteredJobs = () => {
    return sortedJobs.filter(job => {
        const matchesName = job.eventName.toLowerCase().includes(nameFilter.toLowerCase());
        return matchesName;
    });
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
            Available Jobs
        </h1>

        <div className="flex flex-col items-center mb-8">
            <div className="flex justify-between items-center w-full mt-4">
                <div className="flex gap-4">
                    
                    <input
                        type="text"
                        placeholder="Search by Job Name"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="px-4 py-2 bg-neutral-800 text-white rounded transition-colors outline-none w-7/9 mt-5"
                    />
                    
               
                    <AnimatePresence>
                        {!showSortOptions && (
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}      
                                animate={{ opacity: 1, x: 0 }}         
                                exit={{ opacity: 0, x: -20 }}         
                                transition={{ duration: 0.3 }}
                                onClick={toggleSortOptions}
                                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors mt-5 ${
                                    showSortOptions
                                        ? 'bg-neutral-700 text-white'
                                        : 'bg-neutral-800 text-white hover:bg-neutral-700'
                                }`}
                            >
                                <FaSort className="text-xl" />
                                <span className="whitespace-nowrap">Sort by</span>
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showSortOptions && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}        
                                animate={{ opacity: 1, x: 0 }}          
                                exit={{ opacity: animateSortOptions ? 0 : 1, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-3 mt-5"
                            >
                                <span className="text-white whitespace-nowrap">Sort by:</span>

                                <button
                                    className="px-2 py-1 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0 text-sm"
                                    onClick={() => handleSort('eventName')}
                                >
                                    Name
                                </button>

                                <button
                                    className="px-2 py-1 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0 text-sm"
                                    onClick={() => handleSort('eventLoadIn')}
                                >
                                    In Date
                                </button>

                                <button
                                    className="px-2 py-1 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0 text-sm"
                                    onClick={() => handleSort('eventLoadOut')}
                                >
                                    Out Date
                                </button>

                                <button
                                    className="px-2 py-1 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0 text-sm"
                                    onClick={() => handleSort('eventLoadInHours')}
                                >
                                    In Hours
                                </button>

                                <button
                                    className="px-2 py-1 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0 text-sm"
                                    onClick={() => handleSort('eventLoadOutHours')}
                                >
                                    Out Hours
                                </button>

                                

                                <motion.button
                                    initial={{ opacity: 0, x: -20 }}    
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}       
                                    transition={{ delay: 0.2 }}
                                    type="button"
                                    onClick={cancelSortOptions}
                                    className="h-9 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors mt-0"
                                >
                                    Cancel
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                </div>
                <div className="flex items-center gap-3 mt-2">
                    <button
                        onClick={() => setIsGridView(true)}
                        className={`p-2 rounded transition-colors ${
                            isGridView 
                                ? 'bg-neutral-700 text-white' 
                                : 'bg-neutral-800 text-white hover:bg-neutral-700'
                        }`}
                    >
                        <FaTh className="text-xl" />
                    </button>
                    <button
                        onClick={() => setIsGridView(false)}
                        className={`p-2 rounded transition-colors ${
                            !isGridView 
                                ? 'bg-neutral-700 text-white' 
                                : 'bg-neutral-800 text-white hover:bg-neutral-700'
                        }`}
                    >
                        <FaList className="text-xl" />
                    </button>
                </div>
            </div>
        </div>

        <AnimatePresence>
            {getFilteredJobs().length > 0 ? (
                <>
                    {isGridView ? (
                        <div className="w-full">
                            <HoverEffect
                                items={formatJobsForHoverEffect(getFilteredJobs())}
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-neutral-800/50 rounded-lg overflow-hidden">
                                <thead className="bg-neutral-700">
                                    <tr>
                                        <th className="p-4 text-left text-white cursor-pointer" onClick={() => handleSort('eventName')}>
                                            <div className="flex items-center">
                                                Event Name
                                                <span className="ml-2">{getSortIcon('eventName')}</span>
                                            </div>
                                        </th>
                                        <th className="p-4 text-left text-white cursor-pointer" onClick={() => handleSort('eventLoadIn')}>
                                            <div className="flex items-center">
                                                Load In Date
                                                <span className="ml-2">{getSortIcon('eventLoadIn')}</span>
                                            </div>
                                        </th>
                                        <th className="p-4 text-left text-white cursor-pointer" onClick={() => handleSort('eventLoadInHours')}>
                                            <div className="flex items-center">
                                                Load In Hours
                                                <span className="ml-2">{getSortIcon('eventLoadInHours')}</span>
                                            </div>
                                        </th>
                                        <th className="p-4 text-left text-white cursor-pointer" onClick={() => handleSort('eventLoadOut')}>
                                            <div className="flex items-center">
                                                Load Out Date
                                                <span className="ml-2">{getSortIcon('eventLoadOut')}</span>
                                            </div>
                                        </th>
                                        <th className="p-4 text-left text-white cursor-pointer" onClick={() => handleSort('eventLoadOutHours')}>
                                            <div className="flex items-center">
                                                Load Out Hours
                                                <span className="ml-2">{getSortIcon('eventLoadOutHours')}</span>
                                            </div>
                                        </th>
                                        
                                        <th className="p-4 text-left text-white cursor-pointer" onClick={() => handleSort('createdAt')}>
                                            <div className="flex items-center">
                                                Created Date
                                                <span className="ml-2">{getSortIcon('createdAt')}</span>
                                            </div>
                                        </th>
                                        <th className="p-4 text-left text-white cursor-pointer" onClick={() => handleSort('updatedAt')}>
                                            <div className="flex items-center">
                                                Last Modified
                                                <span className="ml-2">{getSortIcon('updatedAt')}</span>
                                            </div>
                                        </th>
                                        <th className="p-4 text-left text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedJobs.map((job) => (
                                        <tr key={job._id} className="border-t border-neutral-700 hover:bg-neutral-700/50 transition-colors cursor-pointer">
                                            <td className="p-4 text-white">{job.eventName}</td>
                                            <td className="p-4 text-white">{new Date(job.eventLoadIn).toLocaleString()}</td>
                                            <td className="p-4 text-white">{job.eventLoadInHours}</td>
                                            <td className="p-4 text-white">{new Date(job.eventLoadOut).toLocaleString()}</td>
                                            <td className="p-4 text-white">{job.eventLoadOutHours}</td>
                                            <td className="p-4 text-white">{new Date(job.createdAt).toLocaleString()}</td>
                                            <td className="p-4 text-white">{new Date(job.updatedAt).toLocaleString()}</td>
                                            <td className="p-4 text-white">
                                                <button 
                                                    onClick={() => handleApply(job._id)} 
                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                                                >
                                                    Apply
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(job._id)} 
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                <motion.div
                    className="flex flex-col items-center justify-center flex-1 min-h-[400px] text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FaRegSadTear className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4" />
                    <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        No Available Jobs
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        There aren't any upcoming jobs available at the moment. Please check back later!
                    </p>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        {showConfirmModal && (
            <Modal>
                <div className="bg-neutral-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div className="p-6 border-b border-neutral-700">
                        <h3 className="text-xl font-semibold text-white">
                            {confirmationType === "apply"
                                ? "Confirm Application"
                                : "Confirm Rejection"}
                        </h3>
                    </div>

                    <div className="p-6">
                        <p className="text-neutral-300 mb-6">
                            {confirmationType === "apply"
                                ? "By applying to this event, you acknowledge that if approved, you will be required to work this event and cannot reject it later. Are you sure you want to apply?"
                                : "Once you reject this event, it will be permanently removed from your available jobs. Are you sure you want to reject this event?"}
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
                                    confirmationType === "apply"
                                        ? "bg-green-500 hover:bg-green-600 text-white"
                                        : "bg-red-500 hover:bg-red-600 text-white"
                                }`}
                            >
                                {confirmationType === "apply" ? "Apply" : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        )}
    </div>
  

);}
