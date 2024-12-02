import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function CorrectionReport() {
    const [formData, setFormData] = useState({
        incidentName: '',
        incidentStartDate: '',
        incidentEndDate: '',
        incidentRequest: '',
        incidentDescription: '',
        incidentFiles: null,
    });
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:8000/incident-report/events');
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
        fetchEvents();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const updatedFormData = { ...formData, files };

        try {
            const response = await fetch('http://localhost:8000/incident-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFormData),
            });
            const result = await response.json();

            if (response.ok) {
                toast.success('Correction Report created successfully!');
                setFormData({
                    incidentName: '',
                    incidentStartDate: '',
                    incidentEndDate: '',
                    incidentRequest: '',
                    incidentDescription: '',
                    incidentFiles: null,
                });
                setFiles(null);
            } else {
                toast.error(result.message || 'Error creating Correction Report');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Server error, please try again later');
        }

        setLoading(false);
    };

    return (
        <form className="w-5/6 max-w-4xl grid grid-cols-2 gap-8 mb-10" onSubmit={handleFormSubmit}>
            <h1 className="text-2xl text-white col-span-2">Correction Report</h1>
            <div className="col-span-2">
                <label className="block text-white mb-2">Event Name</label>
                <select
                    name="incidentName"
                    value={formData.incidentName}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md bg-white text-black"
                    required
                >
                    <option value="" disabled>Select an Event</option>
                    {events.map((event, index) => (
                        <option key={index} value={event.eventName}>
                            {event.eventName}
                        </option>
                    ))}
                </select>
            </div>
            <div className="col-span-1">
                <label className="block text-white mb-2">Start Date</label>
                <input
                    type="date"
                    name="incidentStartDate"
                    value={formData.incidentStartDate}
                    onChange={handleInputChange}
                    className="w-full text-black/40 p-3 border rounded-md"
                    required
                />
            </div>

            <div className="col-span-1">
                <label className="block text-white mb-2">End Date</label>
                <input
                    type="date"
                    name="incidentEndDate"
                    value={formData.incidentEndDate}
                    onChange={handleInputChange}
                    className="w-full text-black/40 p-3 border rounded-md"
                    required
                />
            </div>

            <div className="col-span-1">
                <label className="block text-white mb-2">Kind of Request</label>
                <input
                    type="text"
                    name="incidentRequest"
                    placeholder="Enter Kind of Request"
                    value={formData.incidentRequest}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md"
                />
            </div>

            <div className="col-span-1">
                <label className="block text-white mb-2">Upload Files</label>
                <input
                    type="file"
                    name="incidentFiles"
                    value={formData.incidentFiles}
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full p-2 border rounded-md text-white"
                    multiple
                />
            </div>

            <div className="col-span-2">
                <label className="block text-white mb-2">Event Description</label>
                <textarea
                    name="incidentDescription"
                    placeholder="Enter Event Description"
                    rows="4"
                    value={formData.incidentDescription}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md"
                    required
                />
            </div>

            <div className="flex col-span-2 justify-center">
                <button
                    className="bg-zinc-950 hover:bg-gray-900 text-white font-bold py-1 px-6 rounded-full text-lg flex items-center justify-center"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <svg
                            className="animate-spin h-5 w-5 text-white mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            ></path>
                        </svg>
                    ) : (
                        'Create'
                    )}
                </button>
            </div>
        </form>
    );
}
