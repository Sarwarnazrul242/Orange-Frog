// src/components/admin/ViewEvent.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaTh, FaTable, FaEdit, FaTrashAlt, FaRedo, FaUsers, FaSort } from 'react-icons/fa'; //FaSortAlphaUp, FaSortAlphaDown, FaArrowUp, FaArrowDown, FaClock,
import MultiSelect from './MultiSelect';
import { toast } from 'sonner';
import Modal from "../../../Modal";
import { HoverEffect } from "../../../ui/card-hover-effect";
import { Link, useNavigate } from 'react-router-dom';
import { HoverBorderGradient } from '../../../ui/hover-border-gradient';

export default function ViewEvent() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [contractors, setContractors] = useState([]);
    // const [selectedContractors, setSelectedContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [setSaving] = useState(false);
    const [view, setView] = useState('grid');
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    // const [setShowEditPopup] = useState(false);
    // const [eventToEdit, setEventToEdit] = useState({
    //     eventName: '',
    //     eventLoadIn: '',
    //     eventLoadInHours: '',
    //     eventLoadOut: '',
    //     eventLoadOutHours: '',
    //     eventLocation: '',
    //     eventDescription: '',
    //     assignedContractors: []
    // });
    // const [setShowContractorPopup] = useState(false); 
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

    

    useEffect(() => {
        fetchEvents();
        fetchContractors();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/events`);
            const sortedEvents = response.data.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setEvents(sortedEvents);
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

    const resetFilters = () => {
        setFilterValues({ name: '', location: '', startDate: '', endDate: '', contractor: [] });
    };

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

    // Edit Event

    const handleEdit = (event) => {
        navigate(`/admin/events/edit/${event._id}`, { state: { from: '/admin/manage-events' } });
    };

    // const handleContractorChange = (selectedOptions) => {
    //     setSelectedContractors(selectedOptions.map(option => option.value));
    // };

    // const saveEdit = async (e) => {
    //     e.preventDefault();
    //     setSaving(true);
    //     try {
    //         const originalContractors = eventToEdit.assignedContractors.map(contractor => contractor._id);
    //         const newContractors = selectedContractors.filter(id => !originalContractors.includes(id));

    //         const updatedEvent = { ...eventToEdit, assignedContractors: selectedContractors };
    //         await axios.put(`${process.env.REACT_APP_BACKEND}/events/${eventToEdit._id}`, updatedEvent);

    //         // Send email notifications to new contractors
    //         if (newContractors.length > 0) {
    //             await axios.post(`${process.env.REACT_APP_BACKEND}/events/send-notifications`, {
    //                 eventId: eventToEdit._id,
    //                 contractorIds: newContractors
    //             });
    //         }

    //         setShowEditPopup(false);
    //         setShowContractorPopup(false);
    //         fetchEvents();
    //         toast.success('Event updated successfully!');
    //     } catch (error) {
    //         console.error('Error updating event:', error);
    //         toast.error('Failed to update event');
    //     }

    //     setSaving(false);
    // };

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setEventToEdit({ ...eventToEdit, [name]: value });
    // };

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

    const getFilteredAndSortedEvents = () => {
        let filtered = events.filter(event => {
            if (filterValues.name && !event.eventName.toLowerCase().includes(filterValues.name.toLowerCase())) {
                return false;
            }
            
            if (filterValues.location && !event.eventLocation.toLowerCase().includes(filterValues.location.toLowerCase())) {
                return false;
            }
            
            if (filterValues.startDate && new Date(event.eventLoadIn) < new Date(filterValues.startDate)) {
                return false;
            }
            
            if (filterValues.endDate && new Date(event.eventLoadOut) > new Date(filterValues.endDate)) {
                return false;
            }
            
            if (filterValues.contractor.length > 0 && 
                !filterValues.contractor.some(contractorId =>
                    event.assignedContractors.some(contractor => contractor._id === contractorId)
                )) {
                return false;
            }
            
            return true;
        });
    
        // Sort the filtered events
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (sortConfig.key === 'eventName') {
                    return sortConfig.direction === 'ascending' 
                        ? a.eventName.localeCompare(b.eventName)
                        : b.eventName.localeCompare(a.eventName);
                }
                if (sortConfig.key === 'eventLoadIn' || sortConfig.key === 'eventLoadOut' || sortConfig.key === 'updatedAt') {
                    const dateA = new Date(a[sortConfig.key]);
                    const dateB = new Date(b[sortConfig.key]);
                    return sortConfig.direction === 'ascending' 
                        ? dateA - dateB 
                        : dateB - dateA;
                }
                if (sortConfig.key === 'eventLoadInHours' || sortConfig.key === 'eventLoadOutHours') {
                    return sortConfig.direction === 'ascending'
                        ? a[sortConfig.key] - b[sortConfig.key]
                        : b[sortConfig.key] - a[sortConfig.key];
                }
                if (sortConfig.key === 'assignedContractors') {
                    const countA = a.assignedContractors?.length || 0;
                    const countB = b.assignedContractors?.length || 0;
                    return sortConfig.direction === 'ascending'
                        ? countA - countB
                        : countB - countA;
                }
                return 0;
            });
        }
        
        return filtered;
    };

    // const saveContractorSelection = async () => {
    //     try {
    //         if (!selectedContractor) {
    //             toast.error('Please select a contractor.');
    //             return;
    //         }

    //         const updatedEvent = {
    //             assignedContractors: [selectedContractor],
    //             eventStatus: 'processing',
    //         };

    //         await axios.put(`${process.env.REACT_APP_BACKEND}/events/${selectedEvent._id}`, updatedEvent);

    //         setShowContractorPopup(false);
    //         setSelectedContractor(null);
    //         fetchEvents(); // Refresh the events list
    //         toast.success('Contractor assigned successfully!');
    //     } catch (error) {
    //         console.error('Error assigning contractor:', error);
    //         toast.error('Failed to assign contractor.');
    //     }
    // };

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
                    <div className="flex items-center pt-2 border-t border-neutral-700">
                        <FaUsers className="mr-2 text-neutral-400" />
                        <span className="text-neutral-300">{event.assignedContractors?.length || 0} Contractors</span>
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
                    <Link to="/admin/events/create">
                        <HoverBorderGradient
                            containerClassName="rounded-full"
                            className="dark:bg-black bg-neutral-900 text-white flex items-center space-x-2"
                        >
                            <span className="text-lg mr-1">+</span> 
                            <span>Create Event</span>
                        </HoverBorderGradient>
                    </Link>
                </div>
                
                <div className="flex items-center gap-2 relative">
                    <button
                        onClick={() => setShowFilterDropdown((prev) => !prev)}
                        className="hidden md:block px-4 py-2 mt-0 bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors"
                    >
                        Apply Filter
                    </button>
                    <select
                        ref={selectRef}
                        onChange={handleSortChange}
                        className="hidden md:block px-4 py-2 mx-2 mt-0 bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors outline-none"
                    >
                        <option value="">Sort By</option>
                        <option value="name-asc">Name (Ascending)</option>
                        <option value="name-desc">Name (Descending)</option>
                        <option value="createdAt-asc">Date (Ascending)</option>
                        <option value="createdAt-desc">Date (Descending)</option>
                        <option value="assignedContractors-asc">Contractors (Ascending)</option>
                        <option value="assignedContractors-desc">Contractors (Descending)</option>
                    </select>

                    {showFilterDropdown && (
                        <div 
                            ref={filterDropdownRef} 
                            className="absolute top-full mt-2 left-0 bg-neutral-900 text-white rounded-lg shadow-lg w-52 z-[100] border border-neutral-800"
                        >
                            <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-800">
                                <p className="font-semibold">Select a filter:</p>
                                <FaRedo
                                    className="cursor-pointer hover:text-neutral-400 transition-colors"
                                    onClick={resetFilters}
                                    title="Reset all filters"
                                />
                            </div>
                            <div className="space-y-1 relative">
                                {['name', 'location', 'startDate', 'endDate', 'contractor'].map((field) => (
                                    <div key={field} className="relative group">
                                        <button
                                            onMouseEnter={() => handleFilterFieldChange(field)}
                                            className="flex items-center justify-between text-left w-full px-4 py-2 text-white hover:bg-neutral-800 transition-colors"
                                            style={{ backgroundColor: 'transparent' }}
                                        >
                                            {field.charAt(0).toUpperCase() + field.slice(1)}
                                        </button>

                                        {filterField === field && (
                                            <div className="absolute right-full top-0 bg-neutral-900 text-white rounded-lg shadow-lg p-4 w-72 z-20 mr-4 border border-neutral-800">
                                                <h3 className="font-semibold mb-2">
                                                    Filter by {field.charAt(0).toUpperCase() + field.slice(1)}
                                                </h3>
                                                {field === 'startDate' || field === 'endDate' ? (
                                                    <input
                                                        type="date"
                                                        name={field}
                                                        value={filterValues[field]}
                                                        onChange={handleFilterChange}
                                                        className="w-full p-2 bg-neutral-800 text-white rounded border border-neutral-700 focus:outline-none"
                                                    />
                                                ) : field === 'contractor' ? (
                                                    <MultiSelect
                                                        options={contractors.map(contractor => ({
                                                            value: contractor._id,
                                                            label: contractor.name
                                                        }))}
                                                        value={(Array.isArray(filterValues.contractor) ? filterValues.contractor : []).map(id => ({
                                                            value: id,
                                                            label: contractors.find(contractor => contractor._id === id)?.name
                                                        }))}
                                                        onChange={(selectedOptions) => {
                                                            const selectedContractorIds = selectedOptions.map(option => option.value);
                                                            setFilterValues((prev) => ({ ...prev, contractor: selectedContractorIds }));
                                                        }}
                                                        isMulti
                                                        closeMenuOnSelect={false}
                                                        hideSelectedOptions={false}
                                                        placeholder="Select Contractors"
                                                        className="w-full"
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        name={field}
                                                        placeholder={`Enter ${field}`}
                                                        value={filterValues[field]}
                                                        onChange={handleFilterChange}
                                                        className="w-full p-2 bg-neutral-800 text-white rounded border border-neutral-700 focus:outline-none"
                                                    />
                                                )}
                                                <div className="flex justify-between mt-3">
                                                    <button
                                                        onClick={() => setFilterValues({ ...filterValues, [field]: '' })}
                                                        className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded transition-colors"
                                                    >
                                                        Reset
                                                    </button>
                                                    <button
                                                        onClick={() => setFilterField(null)}
                                                        className="bg-neutral-800 hover:bg-neutral-700 text-white ml-6 px-4 py-2 rounded transition-colors"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                            <FaTable className="text-xl" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative z-0 pb-8">
                {getFilteredAndSortedEvents().length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-neutral-400">
                        <span className="text-6xl mb-4">😢</span>
                        <p className="text-xl">No events found</p>
                        <p className="text-sm mt-2">Try adjusting your filters or create a new event</p>
                    </div>
                ) : (
                    view === 'grid' ? (
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
                                            className="p-4 text-left text-white cursor-pointer"
                                            onClick={() => handleSort('eventName')}
                                        >
                                            Event Name {getSortIcon('eventName')}
                                        </th>
                                        <th 
                                            className="p-4 text-left text-white cursor-pointer"
                                            onClick={() => handleSort('eventLoadIn')}
                                        >
                                            Load In {getSortIcon('eventLoadIn')}
                                        </th>
                                        <th 
                                            className="p-4 text-left text-white cursor-pointer"
                                            onClick={() => handleSort('eventLoadInHours')}
                                        >
                                            Load In Hours {getSortIcon('eventLoadInHours')}
                                        </th>
                                        <th 
                                            className="p-4 text-left text-white cursor-pointer"
                                            onClick={() => handleSort('eventLoadOut')}
                                        >
                                            Load Out {getSortIcon('eventLoadOut')}
                                        </th>
                                        <th 
                                            className="p-4 text-left text-white cursor-pointer"
                                            onClick={() => handleSort('eventLoadOutHours')}
                                        >
                                            Load Out Hours {getSortIcon('eventLoadOutHours')}
                                        </th>
                                        <th 
                                            className="p-4 text-left text-white cursor-pointer"
                                            onClick={() => handleSort('assignedContractors')}
                                        >
                                            Contractors {getSortIcon('assignedContractors')}
                                        </th>
                                        <th 
                                            className="p-4 text-left text-white cursor-pointer"
                                            onClick={() => handleSort('updatedAt')}
                                        >
                                            Last Modified {getSortIcon('updatedAt')}
                                        </th>
                                        <th className="p-4 text-left text-white">Actions</th>
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
                                            <td className="p-4 text-white">{new Date(event.eventLoadIn).toLocaleString()}</td>
                                            <td className="p-4 text-white">{event.eventLoadInHours}h</td>
                                            <td className="p-4 text-white">{new Date(event.eventLoadOut).toLocaleString()}</td>
                                            <td className="p-4 text-white">{event.eventLoadOutHours}h</td>
                                            <td className="p-4 text-white">{event.assignedContractors?.length || 0}</td>
                                            <td className="p-4 text-white">
                                                {event.updatedAt ? new Date(event.updatedAt).toLocaleString() : 'Not modified'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex space-x-2">
                                                    <FaEdit 
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent row click
                                                            handleEdit(event);
                                                        }} 
                                                        className="text-blue-500 cursor-pointer text-xl hover:text-blue-600 transition-colors" 
                                                    />
                                                    <FaTrashAlt 
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent row click
                                                            handleDelete(event);
                                                        }} 
                                                        className="text-red-500 cursor-pointer text-xl hover:text-red-600 transition-colors" 
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
        </div>
    );
}