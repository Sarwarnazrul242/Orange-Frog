import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaInfoCircle, FaEdit, FaTrashAlt, FaUsers, FaCheck, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { HoverBorderGradient } from '../../../ui/hover-border-gradient';
import { toast } from 'sonner';
import Modal from '../../../Modal';

export default function EventDetails() {
    const { eventID } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const fetchEventDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/events/${eventID}`);
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
    }, [eventID]);

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
                    to="/user/current-jobs"
                    className="mb-8 flex items-center text-neutral-400 hover:text-white transition-colors group"
                >
                    <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Current Jobs
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
                    
                <div className="flex justify-center">
                    <Link to={`/user/corrections/create?eventID=${eventID}`}>
                        <HoverBorderGradient
                            containerClassName="rounded-full"
                            className="dark:bg-black bg-neutral-900 text-white flex items-center space-x-2"
                        >
                            <span className="text-lg mr-1">+</span> 
                            <span>Create Correction Report</span>
                        </HoverBorderGradient>
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
}