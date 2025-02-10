import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaList, FaEdit, FaTrashAlt, FaUsers, FaSort, FaTh, FaSortUp, FaSortDown } from 'react-icons/fa';
import { toast } from 'sonner';
import Modal from "../../../Modal";
import { HoverEffect } from "../../../ui/card-hover-effect";
import { Link, useNavigate } from 'react-router-dom';
import { HoverBorderGradient } from '../../../ui/hover-border-gradient';
import { motion, AnimatePresence } from 'framer-motion';

export default function ViewEvent() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSortOptions, setShowSortOptions] = useState(false);
    // const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });


    // View toggle
    const [view, setView] = useState('grid');

    // Delete confirmation
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    // Sort config
    const selectRef = useRef(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // Single filter: name only
    const [nameFilter, setNameFilter] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/events`);
            const sortedEvents = response.data.sort((a, b) => {
                // Sort by creation date descending initially
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setEvents(sortedEvents);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setLoading(false);
        }
    };

    // Delete
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
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event');
        }
    };

    // Edit
    const handleEdit = (event) => {
        navigate(`/admin/events/edit/${event._id}`, { state: { from: '/admin/manage-events' } });
    };

    // Sorting dropdown
    const handleSortChange = (e) => {
        const value = e.target.value;
        if (!value) {
            setSortConfig({ key: null, direction: 'ascending' });
            return;
        }
        const [field, direction] = value.split('-');

        // Map dropdown values to sortConfig keys
        let sortKey;
        switch (field) {
            case 'name':
                sortKey = 'eventName';
                break;
            case 'createdAt':
                sortKey = 'createdAt';
                break;
            case 'assignedContractors':
                sortKey = 'assignedContractors';
                break;
            default:
                sortKey = field;
        }

        setSortConfig({
            key: sortKey,
            direction: direction === 'asc' ? 'ascending' : 'descending'
        });
        
        adjustSelectWidth();
    };

    const sortedEvents = [...events].sort((a, b) => {
        if (sortConfig.key) {
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
        }
        return 0;
    });
    const getSortedEvents = () => {
        return [...events].sort((a, b) => {
            if (sortConfig.key) {
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
            }
            return 0;
        });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    };

    const adjustSelectWidth = () => {
        const selectElement = selectRef.current;
        if (selectElement) {
            const selectedOption = selectElement.options[selectElement.selectedIndex];
            const width = selectedOption.text.length * 8 + 78; 
            selectElement.style.width = `${width}px`;
        }
    };

    useEffect(() => {
        adjustSelectWidth(); // Set initial width
    }, []);

    // Filtering only by name
    const getFilteredAndSortedEvents = () => {
        let filtered = events.filter(event => {
            return !nameFilter || event.eventName.toLowerCase().includes(nameFilter.toLowerCase());
        });
    
        if (sortConfig.key) {
            filtered.sort((a, b) => {
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
        return filtered;
    };

    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <p className="text-white">Loading events...</p>
            </div>
        );
    }

    const handleEventClick = (eventId) => {
        navigate(`/admin/events/${eventId}`);
    };

    const formatEventsForHoverEffect = (events) => {
        return events.map((event) => ({
            title: (
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{event.eventName}</span>
                    <div 
                        className="flex space-x-3"
                        onClick={(e) => e.preventDefault()}
                    >
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
                </div>
            ),
            description: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-neutral-400 font-medium">Load In</p>
                        <div className="pl-2 border-l-2 border-neutral-700">
                            <p className="text-white">{new Date(event.eventLoadIn).toLocaleString()}</p>
                            <p className="text-neutral-300">Hours: {event.eventLoadInHours}h</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-neutral-400 font-medium">Load Out</p>
                        <div className="pl-2 border-l-2 border-neutral-700">
                            <p className="text-white">{new Date(event.eventLoadOut).toLocaleString()}</p>
                            <p className="text-neutral-300">Hours: {event.eventLoadOutHours}h</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-neutral-400 font-medium">Created</p>
                        <div className="pl-2 border-l-2 border-neutral-700">
                            <p className="text-white">{new Date(event.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-neutral-400 font-medium">Last Modified</p>
                        <div className="pl-2 border-l-2 border-neutral-700">
                            <p className="text-white">{new Date(event.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center pt-2 border-t border-neutral-700">
                        <FaUsers className="mr-2 text-neutral-400" />
                        <span className="text-neutral-300">
                            {event.assignedContractors?.length || 0} Contractors
                        </span>
                    </div>
                </div>
            ),
            link: `/admin/events/${event._id}`,
            _id: event._id,
            onClick: (e) => {
                if (!e.defaultPrevented) {
                    handleEventClick(event._id);
                }
            }
        }));
    };

    

    const handleSort = (key) => {
        setSortConfig(prevConfig => {
            const direction = prevConfig.key === key && prevConfig.direction === 'ascending'
                ? 'descending'
                : 'ascending';
            return { key, direction };
        });
    };
    

    return (
        <div className="w-full h-full overflow-auto px-5">
            <div className="flex justify-between items-center mb-5 sticky top-0 bg-neutral-900 py-4 z-50">
                
                {/* Left section: Filter & Sort */}
                <div className="flex items-center gap-3 mt-2">
                    {/* Right section: Create Event button */}
                    <Link to="/admin/events/create">
                        <HoverBorderGradient
                            containerClassName="rounded-full"
                            className="dark:bg-black bg-neutral-900 text-white flex items-center space-x-2"
                        >
                            <span className="text-lg mr-1">+</span> 
                            <span>Create Event</span>
                        </HoverBorderGradient>
                    </Link>
                    
                    <div className='flex items-center gap-3 mt-3'>
                        {/* Name filter input */}
                        <input
                            type="text"
                            placeholder="Search by Name"
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors outline-none mt-2"
                            style={{ minWidth: "150px" }}
                        />

                        {/* Sort dropdown */}
                        <div className="flex items-center gap-3 mt-2">
                            <AnimatePresence>
                                {!showSortOptions && (
                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}      
                                        animate={{ opacity: 1, x: 0 }}         
                                        exit={{ opacity: 0, x: -20 }}         
                                        transition={{ duration: 0.3 }}
                                        onClick={() => setShowSortOptions(true)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded transition-colors mt-0 ${
                                            showSortOptions
                                                ? 'bg-neutral-700 text-white'
                                                : 'bg-neutral-800 text-white hover:bg-neutral-700'
                                        }`}
                                    >
                                        <FaSort className="text-xl" />
                                        <span className="whitespace-nowrap">Filter by</span>
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {showSortOptions && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}        // Start hidden & to the right
                                        animate={{ opacity: 1, x: 0 }}          // Fade in from the right
                                        exit={{ opacity: 0, x: 20 }}            // Fade out to the right when hidden
                                        transition={{ duration: 0.3 }}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="text-white whitespace-nowrap">Sort by:</span>

                                        <button
                                            className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0"
                                            onClick={() => handleSort('eventName')}
                                        >
                                            Name
                                        </button>

                                        <button
                                            className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0"
                                            onClick={() => handleSort('createdAt')}
                                        >
                                            Date
                                        </button>

                                        <button
                                            className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0"
                                            onClick={() => handleSort('assignedContractors')}
                                        >
                                            Contractors
                                        </button>

                                        <motion.button
                                            initial={{ opacity: 0, x: -20 }}    // Fade in from the left
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}       // Fade out to the left when hiding
                                            transition={{ delay: 0.2 }}
                                            type="button"
                                            onClick={() => setShowSortOptions(false)}
                                            className="h-9 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors mt-0"
                                        >
                                            Cancel
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    
                </div>

                
                {/* View toggles (hidden on smaller screens if desired) */}
                <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded transition-colors ${
                                view === 'grid' 
                                    ? 'bg-neutral-700 text-white' 
                                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                            }`}
                        >
                            <FaTh className="text-xl" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded transition-colors ${
                                view === 'list' 
                                    ? 'bg-neutral-700 text-white' 
                                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                            }`}
                        >
                            <FaList className="text-xl" />
                        </button>
                    </div>
            </div>

            <div className="relative z-0 pb-8">
                {getFilteredAndSortedEvents().length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-neutral-400">
                        <span className="text-6xl mb-4">😢</span>
                        <p className="text-xl">No events found</p>
                        <p className="text-sm mt-2">Try adjusting your filter or create a new event</p>
                    </div>
                ) : view === 'grid' ? (
                    <div className="max-w-full mx-auto">
                        <HoverEffect
                            items={formatEventsForHoverEffect(getFilteredAndSortedEvents())}
                            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-auto"
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-neutral-800/50 rounded-lg overflow-hidden">
                            <thead className="bg-neutral-700">
                                <tr>
                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('eventName')}
                                    >
                                        <div className="flex items-center">
                                            Event Name
                                            <span className="ml-2">{getSortIcon('eventName')}</span>
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('eventLoadIn')}
                                    >
                                        <div className="flex items-center">
                                            Load In
                                            <span className="ml-2">{getSortIcon('eventLoadIn')}</span>
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('eventLoadInHours')}
                                    >
                                        <div className="flex items-center">
                                            Load In Hours
                                            <span className="ml-2">{getSortIcon('eventLoadInHours')}</span>
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('eventLoadOut')}
                                    >
                                        <div className="flex items-center">
                                            Load Out
                                            <span className="ml-2">{getSortIcon('eventLoadOut')}</span>
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('eventLoadOutHours')}
                                    >
                                        <div className="flex items-center">
                                            Load Out Hours
                                            <span className="ml-2">{getSortIcon('eventLoadOutHours')}</span>
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('assignedContractors')}
                                    >
                                        <div className="flex items-center">
                                            Contractors
                                            <span className="ml-2">{getSortIcon('assignedContractors')}</span>
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        <div className="flex items-center">
                                            Created
                                            <span className="ml-2">{getSortIcon('createdAt')}</span>
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('updatedAt')}
                                    >
                                        <div className="flex items-center">
                                            Last Modified
                                            <span className="ml-2">{getSortIcon('updatedAt')}</span>
                                        </div>
                                    </th>
                                    <th className="p-4 text-left text-white whitespace-nowrap">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {getFilteredAndSortedEvents().map((event) => (
                                    <tr 
                                        key={event._id} 
                                        className="border-t border-neutral-700 hover:bg-neutral-700/50 transition-colors cursor-pointer"
                                        onClick={() => handleEventClick(event._id)}
                                    >
                                        <td className="p-4 text-white">
                                            {event.eventName}
                                        </td>
                                        <td className="p-4 text-white">
                                            {new Date(event.eventLoadIn).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-white">
                                            {event.eventLoadInHours}h
                                        </td>
                                        <td className="p-4 text-white">
                                            {new Date(event.eventLoadOut).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-white">
                                            {event.eventLoadOutHours}h
                                        </td>
                                        <td className="p-4 text-white">
                                            {event.assignedContractors?.length || 0}
                                        </td>
                                        <td className="p-4 text-white">
                                            {event.createdAt
                                                ? new Date(event.createdAt).toLocaleString()
                                                : 'Not modified'}
                                        </td>
                                        <td className="p-4 text-white">
                                            {event.updatedAt
                                                ? new Date(event.updatedAt).toLocaleString()
                                                : 'Not modified'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-4">
                                                <FaEdit 
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row click
                                                        handleEdit(event);
                                                    }} 
                                                    className="text-blue-500 cursor-pointer text-xl hover:text-blue-600 transition-colors" 
                                                    title="Edit Event" 
                                                />
                                                <FaTrashAlt 
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row click
                                                        handleDelete(event);
                                                    }} 
                                                    className="text-red-500 cursor-pointer text-xl hover:text-red-600 transition-colors" 
                                                    title="Delete Event" 
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Popup */}
            {showDeletePopup && (
                <Modal>
                    <div className="bg-neutral-900 p-8 rounded-md shadow-lg w-full max-w-md border border-neutral-700">
                        <h2 className="text-red-500 text-2xl mb-4">
                            Are you sure you want to delete this Event?
                        </h2>
                        <p className="text-neutral-300 mb-6">
                            This action cannot be undone. Once deleted, this event's data will be
                            permanently removed from the system.
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
        </div>
    );
}
