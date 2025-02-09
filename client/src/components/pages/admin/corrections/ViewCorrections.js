// src/components/admin/ViewEvent.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaList, FaEdit, FaTrashAlt, FaUsers, FaSort, FaTh, FaSortUp, FaSortDown } from 'react-icons/fa';
import MultiSelect from './MultiSelect';
import { toast } from 'sonner';
import Modal from "../../../Modal";
import { HoverEffect } from "../../../ui/card-hover-effect";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// import { HoverBorderGradient } from '../../../ui/hover-border-gradient';

export default function ViewCorrections() {
    const navigate = useNavigate();
    const [corrections, setCorrections] = useState([]);
    const [events, setEvents] = useState(null);
    const [users, setUsers] = useState(null);
    const [contractors, setContractors] = useState([]);
    // const [selectedContractors, setSelectedContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [setSaving] = useState(false);
    const [view, setView] = useState('grid');
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [correctionToDelete, setCorrectionToDelete] = useState(null);
    const [nameFilter, setNameFilter] = useState('');
    const selectRef = useRef(null);
    // const [sortField, setSortField] = useState(null);
    // const [sortDirection, setSortDirection] = useState('asc');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filterField, setFilterField] = useState(null);
    const [filterValues, setFilterValues] = useState({ name: '', location: '', startDate: '', endDate: '', contractor: [] });
    const filterDropdownRef = useRef(null);
    // const [selectedEvent] = useState(null);
    // const [selectedContractor, setSelectedContractor] = useState([]);
    // const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [showSortOptions, setShowSortOptions] = useState(false);

    

    useEffect(() => {
        fetchCorrections();
    }, []);

    useEffect(() => {
        const handleClickOutside = (correction) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(correction.target)) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchCorrections = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/corrections`);
            console.log(response.data); // Debug: Check what is actually returned
    
            // Ensure we're sorting the corrections array inside the response object
            const sortedCorrections = response.data.corrections.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
    
            setCorrections(sortedCorrections);
            setUsers(response.data.users);
            setEvents(response.data.events);
    
            setLoading(false);
        } catch (error) {
            console.error('Error fetching corrections:', error);
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setFilterValues({ name: '', location: '', startDate: '', endDate: '', contractor: [] });
    };

    const handleDelete = (correction) => {
        setCorrectionToDelete(correction);
        setShowDeletePopup(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND}/corrections/${correctionToDelete._id}`);
            setCorrections(corrections.filter(e => e._id !== correctionToDelete._id));
            setShowDeletePopup(false);
            toast.success('Correction deleted successfully!');
        } catch (error) {
            console.error('Error deleting correction:', error);
            toast.error('Failed to delete correction');
        }
    };

    // Edit
    const handleEdit = (correction) => {
        navigate(`/admin/corrections/edit/${correction._id}`, { state: { from: '/admin/manage-corrections' } });
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        if (!value) {
            setSortConfig({ key: null, direction: 'ascending' });
            return;
        }

        const [field, direction] = value.split('-');
        
        // Map dropdown values to sortConfig values
        let sortKey;
        switch (field) {
            case 'name':
                sortKey = 'eventName';
                break;
            case 'loadIn':
                sortKey = 'eventLoadIn';
                break;
            case 'hours':
                sortKey = 'eventLoadInHours';
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

    const handleFilterFieldChange = (field) => {
        setFilterField(field);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterValues((prev) => ({ ...prev, [name]: value }));
    };

    const getFilteredAndSortedCorrections = () => {
        let filtered = corrections.filter(correction => {
            return !nameFilter || correction.correctionName.toLowerCase().includes(nameFilter.toLowerCase());
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
                <p className="text-white">Loading corrections...</p>
            </div>
        );
    }

    const handleEventClick = (correctionId) => {
        navigate(`/users/corrections/${correctionId}`);
    };

    const formatEventsForHoverEffect = (corrections) => {
        return corrections.map((correction) => {
            // Ensure events and correction.eventID exist before accessing properties
            const event = events?.find(e => e._id === correction.eventID);
            const user = users?.find(e => e._id === correction.userID);
    
            return {
                title: (
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">
                            {correction.correctionName}
                        </span>
                        <div 
                            className="flex space-x-3"
                            onClick={(e) => e.preventDefault()}
                        >
                            <FaEdit 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEdit(correction);
                                }} 
                                className="text-blue-500 cursor-pointer text-xl hover:text-blue-600 transition-colors" 
                            />
                            <FaTrashAlt 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(correction);
                                }} 
                                className="text-red-500 cursor-pointer text-xl hover:text-red-600 transition-colors" 
                            />
                        </div>
                    </div>
                ),
                description: (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <span className="text-neutral-400 font-medium">Status:</span>
                            <span className="ml-2 text-white">{correction.status}</span>
                        </div>
                        <div className="space-y-2">
                            <span className="text-neutral-400 font-medium">Event:</span>
                            <span className="ml-2 text-white">{event ? event.eventName : 'Unknown Event'}</span>
                        </div>
                        <div className="space-y-2">
                            <span className="text-neutral-400 font-medium">Created By:</span>
                            <span className="ml-2 text-white">{user ? user.name : 'Unknown User'}</span>
                        </div>
                        <div className="space-y-2">
                            <span className="text-neutral-400 font-medium">Correction Type:</span>
                            <span className="ml-2 text-white">{correction.requestType}</span>
                        </div>
                        <div className="space-y-2">
                            <span className="text-neutral-400 font-medium">Created:</span>
                            <span className="ml-2 text-white">{new Date(correction.submittedAt).toLocaleString()}</span>
                        </div>
                        <div className="space-y-2">
                            <span className="text-neutral-400 font-medium">Last Modified:</span>
                            <span className="ml-2 text-white">{new Date(correction.updatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                ),
                link: `/admin/corrections/${correction._id}`,
                _id: correction._id,
                onClick: (e) => {
                    if (!e.defaultPrevented) {
                        handleEventClick(correction._id);
                    }
                }
            };
        });
    };
    

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    };

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'ascending' 
                ? 'descending' 
                : 'ascending'
        }));
    };

    return (
        <div className="w-full h-full overflow-auto px-5">
            <div className="flex justify-between items-center mb-5 sticky top-0 bg-neutral-900 py-4 z-50">
                <div className="flex items-center gap-4">
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
                                            onClick={() => handleSort('correctionName')}
                                        >
                                            Name
                                        </button>

                                        <button
                                            className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0 whitespace-nowrap"
                                            onClick={() => handleSort('requestType')}
                                        >
                                            Correction Type
                                        </button>

                                        <button
                                            className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0"
                                            onClick={() => handleSort('status')}
                                        >
                                            Status
                                        </button>

                                        <button
                                            className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0 whitespace-nowrap"
                                            onClick={() => handleSort('submittedAt')}
                                        >
                                            Creation Date
                                        </button>

                                        <button
                                            className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0 whitespace-nowrap"
                                            onClick={() => handleSort('updatedAt')}
                                        >
                                            Last Modified Date
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
                <div className="flex items-center gap-2 relative">

                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 mt-0 rounded transition-colors ${
                                view === 'grid' 
                                    ? 'bg-neutral-700 text-white' 
                                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                            }`}
                        >
                            <FaTh className="text-xl" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 mt-0 rounded transition-colors ${
                                view === 'list' 
                                    ? 'bg-neutral-700 text-white' 
                                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                            }`}
                        >
                            <FaList className="text-xl" />
                        </button>
                    </div>
                </div>
            </div>

            

            <div className="relative z-0 pb-8">
                {getFilteredAndSortedCorrections().length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-neutral-400">
                        <span className="text-6xl mb-4">😢</span>
                        <p className="text-xl">No corrections found</p>
                        <p className="text-sm mt-2">Try adjusting your filters or create a new correction</p>
                    </div>
                ) : (
                    view === 'grid' ? (
                        <div className="max-w-full mx-auto">
                            <HoverEffect 
                                items={formatEventsForHoverEffect(getFilteredAndSortedCorrections())} 
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
                                        onClick={() => handleSort('correctionName')}
                                    >
                                        <div className="flex items-center">
                                            Correction Name
                                            <span className="ml-2">{getSortIcon('correctionName')}</span>
                                        </div>
                                    </th>

                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center">
                                            Status
                                            <span className="ml-2">{getSortIcon('status')}</span>
                                        </div>
                                    </th>

                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('eventID')}
                                    >
                                        <div className="flex items-center">
                                            Event
                                            <span className="ml-2">{getSortIcon('eventID')}</span>
                                        </div>
                                    </th>

                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('userID')}
                                    >
                                        <div className="flex items-center">
                                            Created By
                                            <span className="ml-2">{getSortIcon('userID')}</span>
                                        </div>
                                    </th>

                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('requestType')}
                                    >
                                        <div className="flex items-center">
                                            Correction Type
                                            <span className="ml-2">{getSortIcon('requestType')}</span>
                                        </div>
                                    </th>

                                    <th 
                                        className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                                        onClick={() => handleSort('submittedAt')}
                                    >
                                        <div className="flex items-center">
                                            Created
                                            <span className="ml-2">{getSortIcon('submittedAt')}</span>
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
                                    {getFilteredAndSortedCorrections().map((correction) => (
                                        <tr 
                                            key={correction._id} 
                                            className="border-t border-neutral-700 hover:bg-neutral-700/50 transition-colors cursor-pointer"
                                            onClick={() => handleEventClick(correction._id)}
                                        >
                                            <td className="p-4 text-white">
                                                {correction.correctionName}
                                            </td>
                                            <td className="p-4 text-white">
                                                {correction.status}
                                            </td>
                                            <td className="p-4 text-white">
                                                {events?.find(event => event._id === correction.eventID)?.eventName}
                                            </td>
                                            <td className="p-4 text-white">
                                                {users?.find(user => user._id === correction.userID)?.name}
                                            </td>
                                            <td className="p-4 text-white">
                                                {correction.requestType}
                                            </td>
                                            <td className="p-4 text-white">
                                                {new Date(correction.submittedAt).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-white">
                                                {new Date(correction.updatedAt).toLocaleString()}
                                            </td>
                                            
                                            <td className="p-4">
                                                <div className="flex space-x-4">
                                                    <FaEdit 
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent row click
                                                            handleEdit(correction);
                                                        }} 
                                                        className="text-blue-500 cursor-pointer text-xl hover:text-blue-600 transition-colors" 
                                                        title="Edit Event" 
                                                    />
                                                    <FaTrashAlt 
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent row click
                                                            handleDelete(correction);
                                                        }} 
                                                        className="text-red-500 cursor-pointer text-xl hover:text-red-600 transition-colors" 
                                                        title="Delete Correction" 
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>

            {/* Delete Confirmation Popup */}
            {showDeletePopup && (
                <Modal>
                    <div className="bg-neutral-900 p-8 rounded-md shadow-lg w-full max-w-md border border-neutral-700">
                        <h2 className="text-red-500 text-2xl mb-4">Are you sure you want to delete this Correction?</h2>
                        <p className="text-neutral-300 mb-6">
                            This action cannot be undone. Once deleted, this correction's data will be permanently removed from the system.
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