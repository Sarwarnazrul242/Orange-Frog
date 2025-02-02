// src/components/admin/ViewEvent.js
import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { FaList, FaEdit, FaTrashAlt, FaRedo, FaSort, FaTh } from 'react-icons/fa'; //FaSortAlphaUp, FaSortAlphaDown, FaArrowUp, FaArrowDown, FaClock,
import MultiSelect from './MultiSelect';
import { toast } from 'sonner';
import Modal from "../../../Modal";
import { HoverEffect } from "../../../ui/card-hover-effect";
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from "../../../../AuthContext";
import { HoverBorderGradient } from '../../../ui/hover-border-gradient';

export default function ViewCorrections() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [corrections, setCorrections] = useState([]);
    const [events, setEvents] = useState(null);
    const [contractors, setContractors] = useState([]);
    // const [selectedContractors, setSelectedContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [setSaving] = useState(false);
    const [view, setView] = useState('grid');
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [correctionToDelete, setCorrectionToDelete] = useState(null);
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
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/corrections/${auth.email}`);
            console.log(response.data); // Debug: Check what is actually returned
    
            // Ensure we're sorting the corrections array inside the response object
            const sortedCorrections = response.data.corrections.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
    
            setCorrections(sortedCorrections);
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

    // Edit
    const handleEdit = (correction) => {
        navigate(`/user/corrections/edit/${correction._id}`, { state: { from: '/user/manage-corrections' } });
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
            if (filterValues.name && !correction.reportTitle.toLowerCase().includes(filterValues.name.toLowerCase())) {
                return false;
            }
            
            return true;
        });
    
        // Sort the filtered events
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (sortConfig.key === 'reportTitle') {
                    return sortConfig.direction === 'ascending' 
                        ? a.reportTitle.localeCompare(b.reportTitle)
                        : b.reportTitle.localeCompare(a.reportTitle);
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
    
            return {
                title: (
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">
                            {event ? event.eventName : 'Unknown Event'}
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
                            <span className="text-neutral-400 font-medium">Correction Type:</span>
                            <span className="ml-2 text-white">{correction.requestType}</span>
                        </div>
                        <div className="space-y-2">
                            <span className="text-neutral-400 font-medium">Created:</span>
                            <span className="ml-2 text-white">{new Date(correction.submittedAt).toLocaleString()}</span>
                        </div>
                        <div className="space-y-2">
                            <span className="text-neutral-400 font-medium">Last Updated:</span>
                            <span className="ml-2 text-white">{new Date(correction.updatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                ),
                link: `/user/corrections/${correction._id}`,
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
                    <Link to="/user/corrections/create">
                        <HoverBorderGradient
                            containerClassName="rounded-full"
                            className="dark:bg-black bg-neutral-900 text-white flex items-center space-x-2"
                        >
                            <span className="text-lg mr-1">+</span> 
                            <span>Create Correction Report</span>
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
                                        onClick={() => handleSort('reportTitle')}
                                    >
                                        <div className="flex items-center">
                                            Correction Name
                                            <span className="ml-2">{getSortIcon('reportTitle')}</span>
                                        </div>
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
                                                {correction.reportTitle}
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