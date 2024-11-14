// src/components/admin/ViewEvent.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaTh, FaList, FaEdit, FaTrashAlt, FaRedo } from 'react-icons/fa';
import MultiSelect from './MultiSelect';
import { toast } from 'sonner';

export default function ViewEvent() {
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
            const response = await axios.get('http://localhost:8000/events');
            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setLoading(false);
        }
    };

    const fetchContractors = async () => {
        try {
            const response = await axios.get('http://localhost:8000/users');
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
            await axios.delete(`http://localhost:8000/events/${eventToDelete._id}`);
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
            await axios.put(`http://localhost:8000/events/${eventToEdit._id}`, updatedEvent);

            // Send email notifications to new contractors
            if (newContractors.length > 0) {
                await axios.post(`http://localhost:8000/events/send-notifications`, {
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
    
    
    

    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <p className="text-white">Loading events...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-5">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-semibold">Event List</h2>
                <div className="flex items-center gap-2 relative">
                    <button
                        onClick={() => setShowFilterDropdown((prev) => !prev)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg"
                    >
                        Apply Filter
                    </button>
                    <select
                        ref={selectRef}
                        onChange={handleSortChange}
                        className="px-4 py-2 mx-2 mt-5 bg-gray-700 text-white rounded-lg outline-none"
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
                        <div ref={filterDropdownRef} className="absolute top-full mt-2 left-0 bg-gray-700 text-white rounded-lg shadow-lg w-52 z-10">
                            <div className="flex justify-between items-center px-4 py-3">
                                <p className="font-semibold">Select a filter:</p>
                                <FaRedo
                                    className="cursor-pointer hover:text-gray-300"
                                    onClick={resetFilters}
                                    title="Reset all filters"
                                />
                            </div>
                            <div className="space-y-1 relative">
                                {['name', 'location', 'startDate', 'endDate', 'contractor'].map((field) => (
                                    <div key={field} className="relative group">
                                        <button
                                            onMouseEnter={() => handleFilterFieldChange(field)}
                                            className="flex items-center justify-between text-left w-full px-4 py-2 text-white hover:text-gray-500"
                                            style={{ backgroundColor: 'transparent' }}
                                        >
                                            {field.charAt(0).toUpperCase() + field.slice(1)}
                                        </button>

                                        {filterField === field && (
                                            <div className="absolute right-full top-0 bg-gray-700 text-white rounded-lg shadow-lg p-4 w-72 z-20 mr-4">
                                                <h3 className="font-semibold mb-2">
                                                    Filter by {field.charAt(0).toUpperCase() + field.slice(1)}
                                                </h3>
                                                {field === 'startDate' || field === 'endDate' ? (
                                                    <input
                                                        type="date"
                                                        name={field}
                                                        value={filterValues[field]}
                                                        onChange={handleFilterChange}
                                                        className="w-full p-2 bg-gray-600 text-white rounded"
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
                                                        className="w-full bg-gray-600 text-black rounded"
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        name={field}
                                                        placeholder={`Enter ${field}`}
                                                        value={filterValues[field]}
                                                        onChange={handleFilterChange}
                                                        className="w-full p-2 bg-gray-600 text-white rounded"
                                                    />
                                                )}
                                                <div className="flex justify-between mt-3">
                                                    <button
                                                        onClick={() => setFilterValues({ ...filterValues, [field]: '' })}
                                                        className="bg-gray-500 text-white px-4 py-2 rounded"
                                                    >
                                                        Reset
                                                    </button>
                                                    <button
                                                        onClick={() => setFilterField(null)}
                                                        className="bg-white text-black ml-6 px-4 py-2 rounded"
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

                    <div className="flex gap-2">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded ${view === 'grid' ? 'bg-gray-300' : 'bg-gray-500'} hover:bg-gray-300`}
                        >
                            <FaTh className="text-xl" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded ${view === 'list' ? 'bg-gray-300' : 'bg-gray-500'} hover:bg-gray-300`}
                        >
                            <FaList className="text-xl" />
                        </button>
                    </div>
                </div>
            </div>


            <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-4'}>
                    {getFilteredAndSortedEvents().length === 0 ? (
                        <p className='text-white'>No events found.</p>
                    ) : (
                        getFilteredAndSortedEvents().map((event) => (
                            <div
                                key={event._id}
                                className={`bg-gray-800 p-4 rounded-lg shadow-md text-white ${view === 'list' ? 'w-full' : ''}`}
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">{event.eventName}</h3>
                                    <div className="flex space-x-2">
                                        <FaEdit onClick={() => handleEdit(event)} className="text-blue-500 cursor-pointer text-xl" />
                                        <FaTrashAlt onClick={() => handleDelete(event)} className="text-red-500 cursor-pointer text-xl" />
                                    </div>
                                </div>
                                <p className="text-sm">Location: {event.eventLocation}</p>
                                <p className="text-sm">Load In: {new Date(event.eventLoadIn).toLocaleString()}</p>
                                <p className="text-sm">Load Out: {new Date(event.eventLoadOut).toLocaleString()}</p>
                                <p className="text-sm">Hours: {event.eventHours || 'N/A'}</p>
                                <p className="text-sm">Description: {event.eventDescription}</p>
                                <p className="text-sm">
                                    Contractors: {event.assignedContractors && event.assignedContractors.length === 0
                                        ? 'No one has been selected'
                                        : event.assignedContractors.map((contractor) => contractor.name).join(', ')
                                    }
                                </p>
                            </div>
                        ))
                    )}
            </div>


            {/* Delete Confirmation Popup */}
            {showDeletePopup && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
                        <h2 className="text-red-600 text-2xl mb-4">Are you sure you want to delete this Event?</h2>
                        <p className="text-gray-700 mb-6">
                            This action cannot be undone. Once deleted, this event's data will be permanently removed from the system.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setShowDeletePopup(false)} className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-full">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-700 hover:bg-red-900 text-white rounded-full">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Event Popup */}
            {showEditPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded shadow-lg w-full max-w-2xl">
                        <h1 className="self-start text-2xl font-semibold mb-4">Edit Event:</h1>
                        <form className="space-y-4 w-full" onSubmit={saveEdit}>
                            <div className="flex flex-wrap -mx-3 mb-4">
                                <div className="w-full px-3">
                                    <label className="block text-sm font-bold mb-2">Event Name <span className="text-red-500">*</span></label>
                                    <input
                                        className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                        type="text"
                                        name="eventName"
                                        placeholder="Enter Event Name"
                                        value={eventToEdit.eventName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap -mx-3 mb-4">
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-sm font-bold mb-2">Load In <span className="text-red-500">*</span></label>
                                    <input
                                        className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                        type="datetime-local"
                                        name="eventLoadIn"
                                        value={new Date(eventToEdit.eventLoadIn).toISOString().slice(0, 16)}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-sm font-bold mb-2">Load Out <span className="text-red-500">*</span></label>
                                    <input
                                        className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                        type="datetime-local"
                                        name="eventLoadOut"
                                        value={new Date(eventToEdit.eventLoadOut).toISOString().slice(0, 16)}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap -mx-3 mb-4">
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-sm font-bold mb-2">Location <span className="text-red-500">*</span></label>
                                    <input
                                        className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                        type="text"
                                        name="eventLocation"
                                        placeholder="Enter Event Location"
                                        value={eventToEdit.eventLocation}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-sm font-bold mb-2">Total Hours</label>
                                    <input
                                        className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                        type="number"
                                        name="eventHours"
                                        placeholder="Enter Total Hours"
                                        value={eventToEdit.eventHours || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap -mx-3 mb-4">
                                <div className="w-full px-3">
                                    <label className="block text-sm font-bold mb-2">Job Description <span className="text-red-500">*</span></label>
                                    <textarea
                                        className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                        name="eventDescription"
                                        placeholder="Enter Job Description"
                                        rows="3"
                                        value={eventToEdit.eventDescription}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap -mx-3 mb-4">
                                <div className="w-full px-3">
                                    <label className="block text-sm font-bold mb-2">Contractors</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowContractorPopup(true)}
                                        className="appearance-none border rounded w-max py-2 px-3 text-black bg-gray-500/35 hover:bg-gray-700/35"
                                    >
                                        Select Contractors
                                    </button>
                                </div>
                            </div>

                            {showContractorPopup && (
                                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                                    <div className="bg-white p-8 rounded-lg shadow-lg w-[80%] max-w-md relative">
                                        <h2 className="text-xl font-semibold text-black mb-6 text-center">Select Contractors</h2>
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
                                        <div className="flex justify-center mt-6">
                                            <button
                                                onClick={() => setShowContractorPopup(false)}
                                                className="px-1 py-1 bg-black text-white rounded-lg text-lg"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4">
                                <button onClick={() => setShowEditPopup(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                                <button className="px-4 py-2 bg-black text-white rounded flex items-center justify-center" type="submit" disabled={saving}>
                                    {saving ? (
                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                        </svg>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}