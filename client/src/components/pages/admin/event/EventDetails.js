import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaInfoCircle, FaEdit, FaTrashAlt, FaUsers, FaCheck, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Modal from '../../../Modal';

export default function EventDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedContractor, setSelectedContractor] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const fetchEventDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/events/${eventId}`);
            setEvent(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching event details:', error);
            setError(error.response?.data?.message || 'Error fetching event details');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const handleContractorClick = (contractor) => {
        if (event.acceptedContractors?.some(c => c._id === contractor._id)) {
            setSelectedContractor(contractor);
            setShowApprovalModal(true);
        }
    };

    const handleApproval = async (approved) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}/events/${event._id}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contractorId: selectedContractor._id,
                    approved
                }),
            });

            if (response.ok) {
                // Refresh event data
                fetchEventDetails();
                setShowApprovalModal(false);
                toast.success(approved ? 'Contractor approved successfully' : 'Contractor rejected');
            }
        } catch (error) {
            console.error('Error updating contractor status:', error);
            toast.error('Error updating contractor status');
        }
    };

    const handleEdit = (event) => {
        navigate(`/admin/events/edit/${event._id}`, { state: { from: `/admin/events/${event._id}` } });
    };

    const handleDelete = () => {
        setShowDeletePopup(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND}/events/${eventId}`);
            setShowDeletePopup(false);
            toast.success('Event deleted successfully!');
            navigate('/admin/manage-events');
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event');
        }
    };

    if (loading) {
        return <div className="text-white text-center mt-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-8">{error}</div>;
    }

    if (!event) {
        return <div className="text-white text-center mt-8">Event not found</div>;
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col w-full min-h-screen p-8 bg-gradient-to-b from-neutral-900 to-neutral-800"
        >
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex justify-between items-center"
            >
                <Link 
                    to="/admin/manage-events"
                    className="mb-8 flex items-center text-neutral-400 hover:text-white transition-colors group"
                >
                    <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Events
                </Link>
            </motion.div>

            <motion.div 
                className="bg-neutral-800 rounded-lg p-8 shadow-2xl backdrop-blur-sm bg-opacity-90"
                {...fadeIn}
            >   
                <div className='mb-8 border-b border-neutral-700 pb-4 flex justify-between items-center'>
                    <motion.h1 
                        className="text-4xl font-bold text-white "
                        {...fadeIn}
                    >
                        {event.eventName}
                    </motion.h1>
                    <div className="flex space-x-4 -mt-6">
                        <button
                            onClick={() => handleEdit(event)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                            <FaEdit />
                            <span>Edit</span>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                            <FaTrashAlt />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div 
                        className="space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="bg-neutral-700 bg-opacity-40 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <FaInfoCircle className="mr-2 text-blue-400" />
                                Event Details
                            </h2>
                            <div className="space-y-3 text-neutral-300">
                                <p className="flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-red-400" />
                                    <span className="font-medium">Location:</span>
                                    <span className="ml-2">{event.eventLocation}</span>
                                </p>
                                <div className="flex items-center">
                                    <FaClock className="mr-2 text-green-400" />
                                    <div className="flex-1">
                                        <div className="mb-2">
                                            <span className="font-medium">Load In:</span>
                                            <span className="ml-2">{new Date(event.eventLoadIn).toLocaleString()}</span>
                                            <span className="ml-2 text-green-400">({event.eventLoadInHours}h)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <FaClock className="mr-2 text-yellow-400" />
                                    <div className="flex-1">
                                        <div>
                                            <span className="font-medium">Load Out:</span>
                                            <span className="ml-2">{new Date(event.eventLoadOut).toLocaleString()}</span>
                                            <span className="ml-2 text-yellow-400">({event.eventLoadOutHours}h)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="bg-neutral-700 bg-opacity-40 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <FaInfoCircle className="mr-2 text-blue-400" />
                                Description
                            </h2>
                            <p className="text-neutral-300 leading-relaxed">
                                {event.eventDescription || 'No description provided'}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-white mb-4">Invited Freelancers</h2>
                <div className="bg-neutral-800 rounded-lg p-6">
                    {event?.assignedContractors?.filter(contractor => 
                        // Only show contractors who are not approved
                        !event.approvedContractors?.some(ac => ac._id === contractor._id)
                    ).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {event.assignedContractors
                                .filter(contractor => 
                                    // Filter out approved contractors from the invited section
                                    !event.approvedContractors?.some(ac => ac._id === contractor._id)
                                )
                                .map((contractor) => (
                                    <div 
                                        key={contractor._id}
                                        className="bg-neutral-700 rounded-lg p-4 flex flex-col cursor-pointer hover:bg-neutral-600 transition-colors"
                                        onClick={() => handleContractorClick(contractor)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-white font-medium">{contractor.name}</h3>
                                                <p className="text-neutral-400 text-sm">{contractor.email}</p>
                                            </div>
                                            <div>
                                                {event.acceptedContractors?.some(c => c._id === contractor._id) ? (
                                                    <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs">
                                                        Applied
                                                    </span>
                                                ) : event.rejectedContractors?.some(c => c._id === contractor._id) ? (
                                                    <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs">
                                                        Declined
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs">
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-neutral-400 text-center">No freelancers have been invited to this event.</p>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-white mb-4">Approved Freelancers</h2>
                <div className="bg-neutral-800 rounded-lg p-6">
                    {event?.approvedContractors?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {event.approvedContractors.map((contractor) => (
                                <div 
                                    key={contractor._id}
                                    className="bg-neutral-700 rounded-lg p-4 flex flex-col"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-white font-medium">{contractor.name}</h3>
                                            <p className="text-neutral-400 text-sm">{contractor.email}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs">
                                            Approved
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral-400 text-center">No approved freelancers yet.</p>
                    )}
                </div>
            </div>

            {showApprovalModal && (
                <Modal>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="bg-neutral-900 p-8 rounded-xl max-w-md w-full border border-neutral-800 shadow-2xl"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 p-3 bg-neutral-800/50 rounded-full">
                                <FaUsers className="text-3xl text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-2">
                                Contractor Approval
                            </h3>
                            <p className="text-neutral-400 mb-8">
                                Do you want to approve or deny <span className="text-white font-medium">{selectedContractor?.name}</span> for this event?
                            </p>
                            
                            <div className="flex gap-3 w-full">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleApproval(true)}
                                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                                >
                                    <FaCheck className="text-sm" />
                                    Approve
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleApproval(false)}
                                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                                >
                                    <FaTimes className="text-sm" />
                                    Deny
                                </motion.button>
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowApprovalModal(false)}
                                className="mt-4 px-6 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </motion.button>
                        </div>
                    </motion.div>
                </Modal>
            )}

            {showDeletePopup && (
                <Modal>
                    <div className="bg-neutral-900 p-8 rounded-md shadow-lg w-full max-w-md border border-neutral-700">
                        <h2 className="text-red-500 text-2xl mb-4">Are you sure you want to delete this Event?</h2>
                        <p className="text-neutral-300 mb-6">
                            This action cannot be undone. Once deleted, this event's data will be permanently removed from the system.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button 
                                onClick={() => setShowDeletePopup(false)} 
                                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-full transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </motion.div>
    );
}