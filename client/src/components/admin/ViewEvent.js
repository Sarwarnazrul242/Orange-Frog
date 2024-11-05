// src/components/admin/ViewEvent.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTh, FaList, FaEdit, FaTrashAlt } from 'react-icons/fa';

export default function ViewEvent() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('grid'); // 'grid' or 'list' view
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [eventToEdit, setEventToEdit] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchEvents();
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

    const handleDelete = (event) => {
        setEventToDelete(event);
        setShowDeletePopup(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/events/${eventToDelete._id}`);
            setEvents(events.filter(e => e._id !== eventToDelete._id));
            setShowDeletePopup(false);
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleEdit = (event) => {
        setEventToEdit(event);
        setShowEditPopup(true);
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/events/${eventToEdit._id}`, eventToEdit);
            const updatedEvents = events.map(e => e._id === eventToEdit._id ? eventToEdit : e);
            setEvents(updatedEvents);
            setShowEditPopup(false);
            setMessage('Event updated successfully!');
        } catch (error) {
            console.error('Error updating event:', error);
            setMessage('Error updating event');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventToEdit({ ...eventToEdit, [name]: value });
    };

    if (loading) {
        return <p>Loading events...</p>;
    }

    return (
        <div className="w-full p-5">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-semibold">Event List</h2>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setView('grid')}
                        className={`p-2 rounded ${view === 'grid' ? 'bg-gray-300' : 'bg-gray-200'} hover:bg-gray-300`}
                    >
                        <FaTh className="text-xl" />
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`p-2 rounded ${view === 'list' ? 'bg-gray-300' : 'bg-gray-200'} hover:bg-gray-300`}
                    >
                        <FaList className="text-xl" />
                    </button>
                </div>
            </div>

            <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-4'}>
                {events.length === 0 ? (
                    <p>No events found.</p>
                ) : (
                    events.map((event) => (
                        <div
                            key={event._id}
                            className={`bg-gray-800 p-4 rounded shadow-md text-white border border-gray-300 ${
                                view === 'list' ? 'w-full' : ''
                            }`}
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
                            <div className="flex justify-end space-x-4">
                                <button onClick={() => setShowEditPopup(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                                <button className="px-4 py-2 bg-black text-white rounded" type="submit">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {message && <p className="text-green-500 mt-4">{message}</p>}
        </div>
    );
}
