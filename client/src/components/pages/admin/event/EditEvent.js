import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import MultiSelect from './MultiSelect';
import { FaArrowLeft } from 'react-icons/fa';

export default function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contractors, setContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        eventName: '',
        eventLoadIn: '',
        eventLoadInHours: '',
        eventLoadOut: '',
        eventLoadOutHours: '',
        eventLocation: '',
        eventDescription: '',
        assignedContractors: []
    });

    useEffect(() => {
        const fetchEventAndContractors = async () => {
            try {
                const [eventRes, contractorsRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_BACKEND}/events/${id}`),
                    axios.get(`${process.env.REACT_APP_BACKEND}/users`)
                ]);

                // Format dates for input fields
                const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    return date.toISOString().slice(0, 16);
                };

                setFormData({
                    eventName: eventRes.data.eventName,
                    eventLoadIn: formatDate(eventRes.data.eventLoadIn),
                    eventLoadInHours: eventRes.data.eventLoadInHours,
                    eventLoadOut: formatDate(eventRes.data.eventLoadOut),
                    eventLoadOutHours: eventRes.data.eventLoadOutHours,
                    eventLocation: eventRes.data.eventLocation,
                    eventDescription: eventRes.data.eventDescription || '',
                    assignedContractors: eventRes.data.assignedContractors?.map(contractor => contractor._id) || []
                });
                setContractors(contractorsRes.data.filter(user => user.status === 'active'));
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load event data');
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndContractors();
    }, [id]);

    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const getMinLoadOutDateTime = () => {
        if (!formData.eventLoadIn) return getCurrentDateTime();
        return formData.eventLoadIn;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'eventLoadIn') {
            setFormData(prev => {
                if (prev.eventLoadOut && new Date(prev.eventLoadOut) < new Date(value)) {
                    return {
                        ...prev,
                        [name]: value,
                        eventLoadOut: value
                    };
                }
                return {
                    ...prev,
                    [name]: value
                };
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await axios.put(`${process.env.REACT_APP_BACKEND}/events/${id}`, formData);
            toast.success('Event updated successfully');
            navigate('/admin/events');
        } catch (error) {
            console.error('Error updating event:', error);
            toast.error('Failed to update event');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
            <Link 
                to="/admin/manage-events"
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
                Return to Manage Events
            </Link>

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-8">
                    <h1 className="text-3xl font-bold text-white ml-4">Edit Event</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-neutral-800 rounded-lg shadow-xl p-8 space-y-8">
                    <div>
                        <label className="block text-neutral-200 text-lg font-bold mb-2">
                            Event Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleInputChange}
                            maxLength={100}
                            className="w-full px-4 py-3 rounded-lg bg-neutral-700 border border-neutral-600 text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors"
                            required
                        />
                        <p className="text-sm text-neutral-400 mt-1">
                            {formData.eventName.length}/100 characters
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-neutral-200 text-lg font-bold mb-2">
                                Load In <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="eventLoadIn"
                                value={formData.eventLoadIn}
                                onChange={handleInputChange}
                                min={getCurrentDateTime()}
                                className="w-full px-4 py-3 rounded-lg bg-neutral-700 border border-neutral-600 text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-neutral-200 text-lg font-bold mb-2">
                                Load In Hours <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="eventLoadInHours"
                                value={formData.eventLoadInHours}
                                onChange={handleInputChange}
                                min="0"
                                step="0.5"
                                className="w-full px-4 py-3 rounded-lg bg-neutral-700 border border-neutral-600 text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-neutral-200 text-lg font-bold mb-2">
                                Load Out <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="eventLoadOut"
                                value={formData.eventLoadOut}
                                onChange={handleInputChange}
                                min={getMinLoadOutDateTime()}
                                className="w-full px-4 py-3 rounded-lg bg-neutral-700 border border-neutral-600 text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-neutral-200 text-lg font-bold mb-2">
                                Load Out Hours <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="eventLoadOutHours"
                                value={formData.eventLoadOutHours}
                                onChange={handleInputChange}
                                min="0"
                                step="0.5"
                                className="w-full px-4 py-3 rounded-lg bg-neutral-700 border border-neutral-600 text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors"
                                required
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
                            value={formData.eventLocation}
                            onChange={handleInputChange}
                            maxLength={200}
                            className="w-full px-4 py-3 rounded-lg bg-neutral-700 border border-neutral-600 text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors"
                            required
                        />
                        <p className="text-sm text-neutral-400 mt-1">
                            {formData.eventLocation.length}/200 characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-neutral-200 text-lg font-bold mb-2">
                            Description
                        </label>
                        <textarea
                            name="eventDescription"
                            value={formData.eventDescription}
                            onChange={handleInputChange}
                            maxLength={1000}
                            rows="4"
                            className="w-full px-4 py-3 rounded-lg bg-neutral-700 border border-neutral-600 text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                        />
                        <p className="text-sm text-neutral-400 mt-1">
                            {formData.eventDescription.length}/1000 characters
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
                            value={formData.assignedContractors.map(id => ({
                                value: id,
                                label: contractors.find(c => c._id === id)?.name
                            }))}
                            onChange={(selected) => {
                                setFormData(prev => ({
                                    ...prev,
                                    assignedContractors: selected.map(option => option.value)
                                }));
                            }}
                        />
                    </div>

                    <div className="flex justify-center space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/manage-events')}
                            className="px-6 py-2.5 rounded-lg bg-neutral-700 text-white hover:bg-neutral-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-lg bg-black text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}