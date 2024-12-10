import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MultiSelect from './MultiSelect';
import axios from 'axios';
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaInfoCircle, FaEdit, FaTrashAlt, } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Modal from '../../../Modal';

export default function EventDetails() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedContractor, setSelectedContractor] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedContractors, setSelectedContractors] = useState([]);
    const [saving, setSaving] = useState(false);
    const [eventToEdit, setEventToEdit] = useState({
        eventName: '',
        eventLoadIn: '',
        eventLoadInHours: '',
        eventLoadOut: '',
        eventLoadOutHours: '',
        eventLocation: '',
        eventDescription: '',
        assignedContractors: []
    });
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showContractorPopup, setShowContractorPopup] = useState(false);
    const [contractors, setContractors] = useState([]);
    
    useEffect(() => {
        fetchEvents();
        fetchContractors();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/events`);
            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setLoading(false);
        }
    };

    const fetchContractors = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/users`);
            setContractors(response.data.filter(user => user.status === 'active'));
        } catch (error) {
            console.error('Error fetching contractors:', error);
        }
    };

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

    const handleDelete = (event) => {
        setEventToDelete(event);
        setShowDeletePopup(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND}/events/${eventToDelete._id}`);
            setEvents(events.filter(e => e._id !== eventToDelete._id));
            setShowDeletePopup(false);
            toast.success('Event deleted successfully!');
            navigate('/admin/manage-events');
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event');
        }
    };

    // Edit Event

    const handleEdit = (event) => {
        navigate(`/admin/events/edit/${event._id}`, { state: { from: `/admin/events/${event._id}` } });
    };

    const handleContractorChange = (selectedOptions) => {
        setSelectedContractors(selectedOptions.map(option => option.value));
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const originalContractors = eventToEdit.assignedContractors.map(contractor => contractor._id);
            const newContractors = selectedContractors.filter(id => !originalContractors.includes(id));

            const updatedEvent = { ...eventToEdit, assignedContractors: selectedContractors };
            await axios.put(`${process.env.REACT_APP_BACKEND}/events/${eventToEdit._id}`, updatedEvent);

            // Send email notifications to new contractors
            if (newContractors.length > 0) {
                await axios.post(`${process.env.REACT_APP_BACKEND}/events/send-notifications`, {
                    eventId: eventToEdit._id,
                    contractorIds: newContractors
                });
            }

            setShowEditPopup(false);
            setShowContractorPopup(false);
            fetchEvents();
            toast.success('Event updated successfully!');
        } catch (error) {
            console.error('Error updating event:', error);
            toast.error('Failed to update event');
        }

        setSaving(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventToEdit({ ...eventToEdit, [name]: value });
    };

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
                <motion.h1 
                    className="text-4xl font-bold text-white mb-8 border-b border-neutral-700 pb-4 flex justify-between items-center"
                    {...fadeIn}
                >
                    <span>{event.eventName}</span>
                    <div className="flex space-x-4">
                        <FaEdit 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEdit(event);
                            }} 
                            className="text-blue-500 cursor-pointer text-xl hover:text-blue-600 transition-colors" 
                        />
                        <FaTrashAlt 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(event);
                            }} 
                            className="text-red-500 cursor-pointer text-xl hover:text-red-600 transition-colors" 
                        />
                    </div>
                </motion.h1>

                
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
                    <div className="bg-neutral-800 p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            Contractor Approval
                        </h3>
                        <p className="text-neutral-300 mb-6">
                            Do you want to approve or deny {selectedContractor.name} for this event?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => handleApproval(false)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Deny
                            </button>
                            <button
                                onClick={() => handleApproval(true)}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => setShowApprovalModal(false)}
                                className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Popup */}
            {showDeletePopup && (
                <Modal>
                    <div className="bg-neutral-900 p-8 rounded-md shadow-lg w-full max-w-md border border-neutral-700">
                        <h2 className="text-red-500 text-2xl mb-4">Are you sure you want to delete {eventToDelete?.eventName}?</h2>
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

            {/* Edit Event Popup */}
            {showEditPopup && (
                <Modal>
                    <div className="bg-neutral-900 p-8 rounded-lg shadow-lg w-[90%] max-w-3xl relative border border-neutral-700">
                        <h2 className="text-2xl font-semibold text-white mb-6">Edit Event</h2>
                        <form onSubmit={saveEdit} className="space-y-6">
                            <div>
                                <label className="block text-neutral-200 text-lg font-bold mb-2">
                                    Event Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="eventName"
                                    value={eventToEdit.eventName}
                                    onChange={handleInputChange}
                                    maxLength={100}
                                    className="appearance-none border border-neutral-600 rounded w-full py-3 px-4 bg-neutral-700 text-white text-lg leading-tight focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                                    required
                                />
                                <p className="text-sm text-neutral-400 mt-1">
                                    {eventToEdit.eventName.length}/100 characters
                                </p>
                            </div>

                            <div className="flex flex-wrap -mx-3 mb-6">
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Load In <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="eventLoadIn"
                                        value={eventToEdit.eventLoadIn}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-neutral-800 rounded-md text-white"
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Load In Hours <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="eventLoadInHours"
                                        value={eventToEdit.eventLoadInHours}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.5"
                                        className="w-full p-3 bg-neutral-800 rounded-md text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap -mx-3 mb-6">
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Load Out <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="eventLoadOut"
                                        value={eventToEdit.eventLoadOut}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-neutral-800 rounded-md text-white"
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Load Out Hours <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="eventLoadOutHours"
                                        value={eventToEdit.eventLoadOutHours}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.5"
                                        className="w-full p-3 bg-neutral-800 rounded-md text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Contractors
                                    </label>
                                    <MultiSelect
                                        options={contractors.map(contractor => ({
                                            value: contractor._id,
                                            label: contractor.name
                                        }))}
                                        value={selectedContractors.map(id => ({
                                            value: id,
                                            label: contractors.find(contractor => contractor._id === id)?.name
                                        }))}
                                        onChange={handleContractorChange}
                                        isMulti
                                        closeMenuOnSelect={false}
                                        hideSelectedOptions={false}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-200 text-lg font-bold mb-2">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="eventLocation"
                                    value={eventToEdit.eventLocation}
                                    onChange={handleInputChange}
                                    maxLength={200}
                                    className="appearance-none border border-neutral-600 rounded w-full py-3 px-4 bg-neutral-700 text-white text-lg leading-tight focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                                    required
                                />
                                <p className="text-sm text-neutral-400 mt-1">
                                    {eventToEdit.eventLocation.length}/200 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-neutral-200 text-lg font-bold mb-2">
                                    Job Description
                                </label>
                                <textarea
                                    name="eventDescription"
                                    value={eventToEdit.eventDescription}
                                    onChange={handleInputChange}
                                    maxLength={1000}
                                    rows="4"
                                    className="appearance-none border border-neutral-600 rounded w-full py-3 px-4 bg-neutral-700 text-white text-lg leading-tight focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                                />
                                <p className="text-sm text-neutral-400 mt-1">
                                    {eventToEdit.eventDescription.length}/1000 characters
                                </p>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditPopup(false)}
                                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-black text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </motion.div>
    );
}