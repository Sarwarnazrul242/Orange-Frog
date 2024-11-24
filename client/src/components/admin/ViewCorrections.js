import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaTh, FaTable, FaEdit, FaTrashAlt, FaRedo } from 'react-icons/fa';
import MultiSelect from './MultiSelect';
import { toast } from 'sonner';

export default function ViewIncident() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState('grid');
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [incidentToDelete, setIncidentToDelete] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [incidentToEdit, setIncidentToEdit] = useState(null);
    const selectRef = useRef(null);
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filterField, setFilterField] = useState(null);
    const [filterValues, setFilterValues] = useState({ name: '', request: '', startDate: '', endDate: '' });
    const filterDropdownRef = useRef(null);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [files, setFiles] = useState(null); 

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/view-corrections`);
            setIncidents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setFilterValues({ name: '', request: '', startDate: '', endDate: '' });
    };

    const handleDelete = (incident) => {
        setIncidentToDelete(incident);
        setShowDeletePopup(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND}/view-corrections/${incidentToDelete._id}`);
            setIncidents(incidents.filter(i => i._id !== incidentToDelete._id));
            setShowDeletePopup(false);
            toast.success('Incident deleted successfully!');
        } catch (error) {
            console.error('Error deleting incident:', error);
            toast.error('Failed to delete incident');
        }
    };

    const handleEdit = (incident) => {
        setIncidentToEdit(incident);
        setShowEditPopup(true);
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updatedIncident = { ...incidentToEdit };
            await axios.put(`${process.env.REACT_APP_BACKEND}/view-corrections/${incidentToEdit._id}`, updatedIncident);

            setShowEditPopup(false);
            fetchIncidents();
            toast.success('Incident updated successfully!');
        } catch (error) {
            console.error('Error updating incident:', error);
            toast.error('Failed to update incident');
        }

        setSaving(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setIncidentToEdit({ ...incidentToEdit, [name]: value });
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files); // Store selected files in state
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

    const getFilteredAndSortedIncidents = () => {
        let filtered = incidents.filter(incident => {
            if (filterValues.name && !incident.incidentName.toLowerCase().includes(filterValues.name.toLowerCase())) {
                return false;
            }
            if (filterValues.request && !incident.incidentRequest.toLowerCase().includes(filterValues.request.toLowerCase())) {
                return false;
            }
            if (filterValues.startDate && new Date(incident.incidentStartDate) < new Date(filterValues.startDate)) {
                return false;
            }
            if (filterValues.endDate && new Date(incident.incidentEndDate) > new Date(filterValues.endDate)) {
                return false;
            }
            return true;
        });

        // Sort the filtered incidents
        if (sortField) {
            filtered.sort((a, b) => {
                switch (sortField) {
                    case 'name':
                        return sortDirection === 'asc'
                            ? a.incidentName.localeCompare(b.incidentName)
                            : b.incidentName.localeCompare(a.incidentName);
                    case 'startDate':
                        return sortDirection === 'asc'
                            ? new Date(a.incidentStartDate) - new Date(b.incidentStartDate)
                            : new Date(b.incidentStartDate) - new Date(a.incidentStartDate);
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
                <p>Loading incidents...</p>
            </div>
        );
    }

    return (
        <div className="w-full px-5">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-white text-xl md:text-2xl">Incident List</h2>
                <div className="flex items-center gap-2 relative">
                    <button
                        onClick={() => setShowFilterDropdown((prev) => !prev)}
                        className="hidden md:block px-4 py-2 mt-0 bg-gray-500 hover:bg-gray-700 text-white rounded-lg"
                    >
                        Apply Filter
                    </button>
                    <select
                        ref={selectRef}
                        onChange={handleSortChange}
                        className="hidden md:block px-4 py-2 mx-2 mt-0 bg-gray-500 hover:bg-gray-700 text-white rounded-lg outline-none"
                    >
                        <option value="">Sort By</option>
                        <option value="name-asc">Incident Name A-Z</option>
                        <option value="name-desc">Incident Name Z-A</option>
                        <option value="startDate-asc">Start Date Oldest to Newest</option>
                        <option value="startDate-desc">Start Date Newest to Oldest</option>
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
                                {['name', 'location', 'startDate', 'endDate'].map((field) => (
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

                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 mt-0 rounded ${view === 'grid' ? 'bg-gray-300' : 'bg-gray-500'} hover:bg-gray-300`}
                        >
                            <FaTh className="text-xl" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 mt-0 rounded ${view === 'list' ? 'bg-gray-300' : 'bg-gray-500'} hover:bg-gray-300`}
                        >
                            <FaTable className="text-xl" />
                        </button>
                    </div>
                </div>
            </div>
        
                
            <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4' : 'overflow-x-auto'}>
                {getFilteredAndSortedIncidents().length === 0 ? (
                    <p className="text-white">No incidents found.</p>
                ) : (
                    view === 'grid' ? (
                        getFilteredAndSortedIncidents().map((incident) => (
                            <div
                                key={incident._id}
                                className={`bg-gray-800 p-4 rounded-lg flex flex-col justify-between shadow-md text-white ${view === 'list' ? 'w-full' : ''}`}
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">{incident.incidentName}</h3>
                                    <div className="flex space-x-2">
                                        <FaEdit onClick={() => handleEdit(incident)} className="text-blue-500 cursor-pointer text-xl" />
                                        <FaTrashAlt onClick={() => handleDelete(incident)} className="text-red-500 cursor-pointer text-xl" />
                                    </div>
                                </div>
                                <p className="text-sm">Request: {incident.incidentRequest}</p>
                                <p className="text-sm">Start Date: {new Date(incident.incidentStartDate).toLocaleString()}</p>
                                <p className="text-sm">End Date: {new Date(incident.incidentEndDate).toLocaleString()}</p>
                                <p className="text-sm">Description: {incident.incidentDescription}</p>
                            </div>
                        ))
                    ) : (
                <table className="min-w-full text-white">
                    <thead>
                        <tr className="border-b-4 border-white">
                            <th className="p-4 text-left">Incident Name</th>
                            <th className="p-4 text-left">Request</th>
                            <th className="p-4 text-left">Start Date</th>
                            <th className="p-4 text-left">End Date</th>
                            <th className="p-4 text-left">Description</th>
                            <th className="p-4 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getFilteredAndSortedIncidents().map((incident) => (
                            <tr key={incident._id} className="border-t border-white hover:bg-gray-800/50 transition">
                                <td className="p-4">{incident.incidentName}</td>
                                <td className="p-4">{incident.incidentRequest}</td>
                                <td className="p-4">{new Date(incident.incidentStartDate).toLocaleString()}</td>
                                <td className="p-4">{new Date(incident.incidentEndDate).toLocaleString()}</td>
                                <td className="p-4">{incident.incidentDescription}</td>
                                <td className="p-4">
                                    <div className="flex space-x-2">
                                        <FaEdit onClick={() => handleEdit(incident)} className="text-blue-500 cursor-pointer text-xl" />
                                        <FaTrashAlt onClick={() => handleDelete(incident)} className="text-red-500 cursor-pointer text-xl" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                        )
                    )}
            </div>

            {/* Delete Confirmation Popup */}
            {showDeletePopup && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
                        <h2 className="text-red-600 text-2xl mb-4">Are you sure you want to delete this Incident?</h2>
                        <p className="text-gray-700 mb-6">
                            This action cannot be undone. Once deleted, this incident's data will be permanently removed from the system.
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
            {/* Edit Incident Popup */}
            {showEditPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded shadow-lg w-full max-w-2xl">
                        <h1 className="self-start text-2xl font-semibold mb-4">Edit Incident:</h1>
                        <form className="space-y-4 w-full" onSubmit={saveEdit}>
                            <div className="flex flex-wrap -mx-3 mb-4">
                                <div className="w-full px-3">
                                    <label className="block text-sm font-bold mb-2">Incident Name <span className="text-red-500">*</span></label>
                                    <input
                                        className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                        type="text"
                                        name="incidentName"
                                        placeholder="Enter Incident Name"
                                        value={incidentToEdit.incidentName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap -mx-3 mb-4">
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-sm font-bold mb-2">Start Date <span className="text-red-500">*</span></label>
                                    <input
                                        className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                        type="date"
                                        name="incidentStartDate"
                                        value={new Date(incidentToEdit.incidentStartDate).toISOString().slice(0, 16)}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-sm font-bold mb-2">End Date <span className="text-red-500">*</span></label>
                                    <input
                                        className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                        type="date"
                                        name="incidentEndDate"
                                        value={new Date(incidentToEdit.incidentEndDate).toISOString().slice(0, 16)}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap -mx-3 mb-4">
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-sm font-bold mb-2">Request <span className="text-red-500">*</span></label>
                                    <input
                                        className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                        type="text"
                                        name="incidentRequest"
                                        placeholder="Enter Request"
                                        value={incidentToEdit.incidentRequest}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-1/2 px-3">
                                    <label className="block text-sm font-bold mb-2">Upload Files <span className="text-red-500">*</span></label>
                                    {/* <p className="block text-white mb-2">Select Files Here:</p> */}
                                    <input
                                        className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                        type="file"
                                        name="incidentFiles"
                                        value={incidentToEdit.incidentFiles}
                                        onChange={handleFileChange} // Handle file change
                                        multiple // Allow multiple file uploads
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap -mx-3 mb-4">
                                <div className="w-full px-3">
                                    <label className="block text-sm font-bold mb-2">Incident Description <span className="text-red-500">*</span></label>
                                    <textarea
                                        className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                        name="incidentDescription"
                                        placeholder="Enter Job Description"
                                        rows="3"
                                        value={incidentToEdit.incidentDescription}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button onClick={() => setShowEditPopup(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                                <button className="px-4 py-2 bg-black text-white rounded flex items-center justify-center" type="submit" disabled={saving}>
                                    {saving ? (
                                        <svg
                                            className="animate-spin h-5 w-5 mr-2 text-white"
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
                                        <>
                                            <span className="block md:hidden">Save</span> {/* Mobile text */}
                                            <span className="hidden md:block">Save Changes</span> {/* Desktop text */}
                                        </>
                                    )}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
