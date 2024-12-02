// src/components/admin/ViewEvent.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaTh, FaTable, FaEdit, FaTrashAlt, FaRedo, FaSortAlphaUp, FaSortAlphaDown, FaArrowUp, FaArrowDown } from 'react-icons/fa';
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
    const [selectedContractors, setSelectedContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState('grid');
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [eventToEdit, setEventToEdit] = useState(null);
    const [showContractorPopup, setShowContractorPopup] = useState(false);
    const selectRef = useRef(null);
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filterField, setFilterField] = useState(null);
    const [filterValues, setFilterValues] = useState({ name: '', location: '', startDate: '', endDate: '', contractor: [] });
    const filterDropdownRef = useRef(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedContractor, setSelectedContractor] = useState([]);
    const [error, setError] = useState(null);

    

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
            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setLoading(false);
        }
    };

    const handleSelectContractor = (event) => {
        setSelectedEvent(event);
        setShowContractorPopup(true);
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

    const handleEdit = (event) => {
        setEventToEdit(event);
        setSelectedContractors(
            event.assignedContractors ? event.assignedContractors.map(contractor => contractor._id) : []
        );
        setShowEditPopup(true);
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

    const handleSortChange = (e) => {
        const value = e.target.value;
        const [field, direction] = value.split('-');
        setSortField(field);
        setSortDirection(direction);
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
        if (sortField) {
            filtered.sort((a, b) => {
                switch (sortField) {
                    case 'name':
                        return sortDirection === 'asc'
                            ? a.eventName.localeCompare(b.eventName)
                            : b.eventName.localeCompare(a.eventName);
                    case 'loadIn':
                        return sortDirection === 'asc'
                            ? new Date(a.eventLoadIn) - new Date(b.eventLoadIn)
                            : new Date(b.eventLoadIn) - new Date(a.eventLoadIn);
                    case 'hours':
                        return sortDirection === 'asc'
                            ? (a.eventHours || 0) - (b.eventHours || 0)
                            : (b.eventHours || 0) - (a.eventHours || 0);
                    default:
                        return 0;
                }
            });
        }
        
        return filtered;
    };

    const saveContractorSelection = async () => {
        try {
            if (!selectedContractor) {
                toast.error('Please select a contractor.');
                return;
            }

            const updatedEvent = {
                assignedContractors: [selectedContractor],
                eventStatus: 'processing',
            };

            await axios.put(`${process.env.REACT_APP_BACKEND}/events/${selectedEvent._id}`, updatedEvent);

            setShowContractorPopup(false);
            setSelectedContractor(null);
            fetchEvents(); // Refresh the events list
            toast.success('Contractor assigned successfully!');
        } catch (error) {
            console.error('Error assigning contractor:', error);
            toast.error('Failed to assign contractor.');
        }
    };
    
    
    

    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <p className="text-white">Loading events...</p>
            </div>
        );
    }

    const renderModal = (isOpen, content) => {
        if (!isOpen) return null;
        
        return (
            <Modal>
                {content}
            </Modal>
        );
    };

    const handleEventClick = (eventId) => {
        navigate(`/admin/events/${eventId}`);
    };

    const formatEventsForHoverEffect = (events) => {
        return events.map((event) => ({
            title: (
                <div className="flex justify-between items-center">
                    <span>{event.eventName}</span>
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
                <div className="space-y-2">
                    <p>Location: {event.eventLocation}</p>
                    <p>Load In: {new Date(event.eventLoadIn).toLocaleString()}</p>
                    <p>Load Out: {new Date(event.eventLoadOut).toLocaleString()}</p>
                    <p>Hours: {event.eventHours || 'N/A'}</p>
                    <div>
                        Contractors:
                        <ul className="list-disc ml-4">
                            {event.assignedContractors && event.assignedContractors.length > 0 ? (
                                event.assignedContractors.map((contractor) => (
                                    <li key={contractor._id}>{contractor.name}</li>
                                ))
                            ) : (
                                <li>No one has been selected</li>
                            )}
                        </ul>
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

    const renderGridView = () => (
        <div className="max-w-full mx-auto">
            <HoverEffect 
                items={formatEventsForHoverEffect(getFilteredAndSortedEvents())} 
                className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-auto"
            />
        </div>
    );

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
                        <option value="name-asc">Event Name A-Z</option>
                        <option value="name-desc">Event Name Z-A</option>
                        <option value="loadIn-asc">Oldest to Newest</option>
                        <option value="loadIn-desc">Newest to Oldest</option>
                        <option value="hours-asc">Hours Ascending</option>
                        <option value="hours-desc">Hours Descending</option>
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
                            <table className="min-w-full bg-neutral-800 rounded-lg overflow-hidden">
                                <thead className="bg-neutral-700">
                                    <tr>
                                        <th className="p-4 text-left text-white">
                                            <div className="flex items-center">
                                                Event Name
                                                <span onClick={() => handleSortChange({ target: { value: `name-${sortDirection === 'asc' ? 'desc' : 'asc'}` }})} className="ml-2 cursor-pointer">
                                                    {sortField === 'name' && sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-4 text-left text-white">
                                            <div className="flex items-center">
                                                Location
                                                <span onClick={() => handleSortChange({ target: { value: `location-${sortDirection === 'asc' ? 'desc' : 'asc'}` }})} className="ml-2 cursor-pointer">
                                                    {sortField === 'location' && sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-4 text-left text-white">
                                            <div className="flex items-center">
                                                Load In
                                                <span onClick={() => handleSortChange({ target: { value: `loadIn-${sortDirection === 'asc' ? 'desc' : 'asc'}` }})} className="ml-2 cursor-pointer">
                                                    {sortField === 'loadIn' && sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-4 text-left text-white">Load Out</th>
                                        <th className="p-4 text-left text-white">Hours</th>
                                        <th className="p-4 text-left text-white">Contractors</th>
                                        <th className="p-4 text-left text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredAndSortedEvents().map((event) => (
                                        <tr 
                                            key={event._id} 
                                            className="border-t border-neutral-700 hover:bg-neutral-700/50 transition-colors"
                                        >
                                            <td className="p-4 text-white truncate">{event.eventName}</td>
                                            <td className="p-4 text-white truncate">{event.eventLocation}</td>
                                            <td className="p-4 text-white">{new Date(event.eventLoadIn).toLocaleString()}</td>
                                            <td className="p-4 text-white">{new Date(event.eventLoadOut).toLocaleString()}</td>
                                            <td className="p-4 text-white">{event.eventHours || 'N/A'}</td>
                                            <td className="p-4 text-white">
                                                <ul className="list-disc ml-4">
                                                    {event.assignedContractors && event.assignedContractors.length > 0 ? (
                                                        event.assignedContractors.map((contractor) => (
                                                            <li key={contractor._id}>{contractor.name}</li>
                                                        ))
                                                    ) : (
                                                        <li>No one has been selected</li>
                                                    )}
                                                </ul>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex space-x-2">
                                                    <FaEdit 
                                                        onClick={() => handleEdit(event)} 
                                                        className="text-blue-500 cursor-pointer text-xl hover:text-blue-600 transition-colors" 
                                                    />
                                                    <FaTrashAlt 
                                                        onClick={() => handleDelete(event)} 
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
            {showContractorPopup && (
                <Modal>
                    <div className="bg-neutral-900 w-full max-w-lg p-6 rounded shadow-lg border border-neutral-700">
                        <h2 className="text-xl font-bold mb-4 text-white text-center">Select Contractor</h2>
                        {selectedEvent && selectedEvent.acceptedContractors && selectedEvent.acceptedContractors.length > 0 ? (
                            <ul>
                                {selectedEvent.acceptedContractors.map((contractor) => (
                                    <label key={contractor._id} className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            name="contractor"
                                            value={contractor._id}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedContractor((prev) => [...prev, contractor._id]);
                                                } else {
                                                    setSelectedContractor((prev) => prev.filter((id) => id !== contractor._id));
                                                }
                                            }}
                                            className="mr-2"
                                        />
                                        <p className="text-sm text-white truncate" style={{ maxWidth: '200px' }}>
                                            {contractor.name || 'Unnamed Contractor'}
                                        </p>
                                    </label>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-neutral-400">No contractors have expressed interest yet.</p>
                        )}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setShowContractorPopup(false)}
                                className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded mr-2 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveContractorSelection}
                                className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Load In <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="eventLoadIn"
                                        value={eventToEdit.eventLoadIn}
                                        onChange={handleInputChange}
                                        className="appearance-none border border-neutral-600 rounded w-full py-3 px-4 bg-neutral-700 text-white text-lg leading-tight focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Load Out <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="eventLoadOut"
                                        value={eventToEdit.eventLoadOut}
                                        onChange={handleInputChange}
                                        className="appearance-none border border-neutral-600 rounded w-full py-3 px-4 bg-neutral-700 text-white text-lg leading-tight focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-neutral-200 text-lg font-bold mb-2">
                                        Total Hours <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="eventHours"
                                        value={eventToEdit.eventHours}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="168"
                                        className="appearance-none border border-neutral-600 rounded w-full py-3 px-4 bg-neutral-700 text-white text-lg leading-tight focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                                        required
                                    />
                                    <p className="text-sm text-neutral-400 mt-1">
                                        Maximum: 168 hours (1 week)
                                    </p>
                                </div>
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
        </div>
    );
}