// src/components/admin/ManageUsers.js
import React, { useState, useEffect, useRef } from 'react';
import { FaTh, FaList, FaEdit, FaTrashAlt, FaRedo, FaSortAlphaDown, FaSortAlphaUp, FaSearch, FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import autoAnimate from '@formkit/auto-animate';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import Modal from "../../../Modal"; 
import { Link } from 'react-router-dom';
import { HoverBorderGradient } from '../../../ui/hover-border-gradient';
import { HoverEffect } from "../../../ui/card-hover-effect";
import CreateUsers from './CreateUsers';

const EditPopup = ({ user, onSave, onCancel }) => {
    const [isEmailEditable, setIsEmailEditable] = useState(false);

    return (
        <Modal>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-neutral-900/90 p-8 rounded-lg shadow-lg max-w-2xl w-full border border-neutral-700/50">
                    <h2 className="text-2xl mb-4 text-white">Edit User</h2>
                    <form onSubmit={onSave} className="grid grid-cols-2 gap-8">
                        <div className="col-span-1">
                            <label className="block text-neutral-300 mb-2">Name</label>
                            <p className="text-white p-3 bg-neutral-800 rounded-md">{user.name}</p>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-neutral-300 mb-2">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    onChange={(e) => user.onChange(e)}
                                    className="w-full p-3 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:border-neutral-500 focus:outline-none"
                                    disabled={!isEmailEditable}
                                    required
                                />
                                <FaEdit 
                                    onClick={() => setIsEmailEditable(!isEmailEditable)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-blue-500 hover:text-blue-400"
                                />
                            </div>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-neutral-300 mb-2">Hourly Rate</label>
                            <input
                                type="number"
                                name="hourlyRate"
                                defaultValue={user.hourlyRate}
                                className="w-full p-3 bg-neutral-800 rounded-md text-white"
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-neutral-300 mb-2">Address</label>
                            <p className="text-white p-3 bg-neutral-800 rounded-md">{user.address || 'Not provided'}</p>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-neutral-300 mb-2">Phone</label>
                            <p className="text-white p-3 bg-neutral-800 rounded-md">{user.phone || 'Not provided'}</p>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-neutral-300 mb-2">Date of Birth</label>
                            <p className="text-white p-3 bg-neutral-800 rounded-md">{user.dob || 'Not provided'}</p>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-neutral-300 mb-2">T-Shirt Size</label>
                            <p className="text-white p-3 bg-neutral-800 rounded-md">{user.shirtSize || 'Not provided'}</p>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-neutral-300 mb-2">First Aid Certified</label>
                            <p className="text-white p-3 bg-neutral-800 rounded-md">{user.firstAidCert || 'Not provided'}</p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-neutral-300 mb-2">Allergies</label>
                            {user.allergies?.length > 0 ? (
                                <ul className="list-disc list-inside text-white p-3 bg-neutral-800 rounded-md">
                                    {user.allergies.map((allergy, index) => (
                                        <li key={index}>{allergy}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-white p-3 bg-neutral-800 rounded-md">No allergies listed</p>
                            )}
                        </div>
                        <div className="col-span-2 flex justify-center mt-4 space-x-4">
                            <button 
                                type="button" 
                                onClick={onCancel} 
                                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-black text-white rounded-full transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
};

const UserRow = ({ name, email, status, hourlyRate, onEdit, onDelete, onResendEmail }) => (
    <article className="grid grid-cols-5 items-center w-full border-b-[1px] border-b-white/40 relative text-sm md:text-base">
        <div className="col-span-1 py-2 px-2 md:py-4 md:px-4 text-white truncate">
            {name}
        </div>
        <div className="col-span-1 py-2 px-2 md:py-4 md:px-4 text-white truncate">
            {email}
        </div>
        <div className="col-span-1 py-2 px-2 md:py-4 md:px-4 text-white">
            <span className={`${status === 'Pending' ? 'text-yellow-500' : 'text-green-500'}`}>
                {status}
            </span>
        </div>
        <div className="col-span-1 py-2 px-2 md:py-4 md:px-4 text-white">
            ${hourlyRate}/hr
        </div>
        <div className="col-span-1 py-2 px-2 md:py-4 md:px-4 flex items-center justify-end gap-4">
            {status === 'Pending' && (
                <FaRedo 
                    onClick={onResendEmail} 
                    className="text-lg md:text-xl text-white cursor-pointer hover:text-blue-400 transition-colors" 
                />
            )}
            <FaEdit 
                onClick={onEdit} 
                className="text-lg md:text-xl text-blue-500 cursor-pointer hover:text-blue-400 transition-colors" 
            />
            <FaTrashAlt 
                onClick={onDelete} 
                className="text-lg md:text-xl text-red-500 cursor-pointer hover:text-red-400 transition-colors" 
            />
        </div>
    </article>
);


const ConfirmationPopup = ({ user, onConfirm, onCancel }) => (
    <Modal>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-neutral-900/90 p-8 rounded-lg shadow-lg w-full max-w-md border border-neutral-700/50">
                <h2 className="text-red-500 text-2xl mb-4">
                    Are you sure you want to delete {user.name}?
                </h2>
                <p className="text-neutral-300 mb-6">
                    This action cannot be undone. Once deleted, {user.name}'s data will be permanently removed from the system.
                </p>
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={onCancel} 
                        className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    </Modal>
);

export default function ViewUsers() {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editFormData, setEditFormData] = useState({ name: "", email: "" });
    const [showPopup, setShowPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isGridView, setIsGridView] = useState(true);
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchText, setSearchText] = useState(""); 
    const [showSearchBox, setShowSearchBox] = useState(false);


    const formParent = useRef(null);

    useEffect(() => {
        formParent.current && autoAnimate(formParent.current);
        fetchUsers();
    }, [formParent]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/users`);
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error('Failed to fetch users. Please reload the page.');
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check if the current screen size is mobile
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setIsGridView(true); // Force grid view on mobile
            }
        };
    
        handleResize(); // Call on initial load
        window.addEventListener('resize', handleResize);
    
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    

    const handleResendEmail = async (userId) => {
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND}/resend-email/${userId}`);
            toast.success('Email resent successfully!');
        } catch (error) {
            console.error("Error resending email:", error);
            toast.error('Failed to resend email. Please try again.');
        }
    };

    const handleDelete = (id) => {
        setSelectedUser(id);
        setShowPopup(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND}/delete-user/${selectedUser}`);
            setUsers(users.filter(user => user._id !== selectedUser));
            setShowPopup(false);
            toast.success('User deleted successfully!');
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error('Failed to delete user. Please try again.');
        }
    };
    

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditFormData({ name: user.name, email: user.email });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND}/update-user/${editingUser._id}`, editFormData);
            if (response.status === 200) {
                setUsers(users.map(user => (user._id === editingUser._id ? response.data : user)));
                setEditingUser(null);
                toast.success('User updated successfully!');
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error('Failed to update user. Please try again.');
        }
    };
    

    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <p className="text-white">Loading Users...</p>
            </div>
        );
    }

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };


    const getFilteredAndSortedUsers = () => {
        // Filter users by search text
        const filteredUsers = users.filter(user =>
            user.name.toLowerCase().includes(searchText.toLowerCase())
        );

        // Sort filtered users
        if (!sortField) return filteredUsers;

        return [...filteredUsers].sort((a, b) => {
            // Special handling for hourlyRate
            if (sortField === 'hourlyRate') {
                const aValue = parseFloat(a[sortField]) || 0;
                const bValue = parseFloat(b[sortField]) || 0;
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // For other string fields
            const aValue = String(a[sortField]).toLowerCase();
            const bValue = String(b[sortField]).toLowerCase();

            if (sortDirection === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
    };

    const formatUsersForHoverEffect = (users) => {
        return users.map((user) => ({
            title: (
                <div className="flex justify-between items-center">
                    <span>{user.name}</span>
                    <div className="flex space-x-3">
                        <FaEdit 
                            onClick={(e) => {
                                e.preventDefault();
                                handleEdit(user);
                            }} 
                            className="text-blue-500 cursor-pointer text-xl hover:text-blue-600 transition-colors" 
                        />
                        <FaTrashAlt 
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete(user._id);
                            }} 
                            className="text-red-500 cursor-pointer text-xl hover:text-red-600 transition-colors" 
                        />
                    </div>
                </div>
            ),
            description: (
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-zinc-400">Email:</span>
                        <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-zinc-400">Hourly Rate:</span>
                        <span>${user.hourlyRate}/hr</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-zinc-400">Status:</span>
                        <span className={`${user.temporaryPassword ? 'text-yellow-500' : 'text-green-500'}`}>
                            {user.temporaryPassword ? 'Pending' : 'Active'}
                        </span>
                    </div>
                    {user.temporaryPassword && (
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleResendEmail(user._id);
                                }}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                            >
                                Resend Email
                            </button>
                        </div>
                    )}
                </div>
            ),
            link: '#'
        }));
    };

    return (
        <div className="w-full h-full overflow-auto">
            <CreateUsers onUserCreated={fetchUsers} />
            
            {getFilteredAndSortedUsers().length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-white/60">
                    <div className="text-6xl mb-4">😢</div>
                    <p className="text-xl">No users found</p>
                    {searchText && (
                        <p className="text-sm mt-2">
                            Try adjusting your search criteria
                        </p>
                    )}
                </div>
            ) : (
                <>
                    <div className="w-full flex justify-between items-center mb-5 mt-5">
                        <div className="flex items-center space-x-2">
                            <span
                                onClick={() => setShowSearchBox(!showSearchBox)}
                                className="cursor-pointer text-white/60 hover:text-white transition-colors flex items-center px-2"
                            >
                                <FaSearch className="text-lg" />
                            </span>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="Search by name"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className={`${
                                        showSearchBox ? 'w-40 md:w-54 lg:w-64 px-4 rounded-full bg-white/10 text-white placeholder:text-white/50 outline-none transition-all duration-300 overflow-hidden border border-white/20 focus:border-white/40' : 'hidden'
                                    }`}
                                    style={{
                                        transition: 'width 0.3s ease',
                                        height: '2.5rem', 
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-2 items-center">
                            <button
                                onClick={() => setIsGridView(false)}
                                className={`hidden md:flex px-3 py-0 md:px-4 md:py-2 ${
                                    !isGridView ? 'bg-white/20' : 'bg-white/10'
                                } text-white rounded-l-full items-center hover:bg-white/30 transition-colors`}
                            >
                                <FaList className="mr-1 text-base md:text-xl" />
                            </button>
                            <button
                                onClick={() => setIsGridView(true)}
                                className={`hidden md:flex px-3 py-0 md:px-4 md:py-2 ${
                                    isGridView ? 'bg-white/20' : 'bg-white/10'
                                } text-white rounded-r-full items-center hover:bg-white/30 transition-colors`}
                            >
                                <FaTh className="mr-1 text-base md:text-xl" />
                            </button>
                        </div>
                    </div>



                    <section className="w-full flex flex-col items-center mb-10">
                        {isGridView && (
                            <div className="w-full">
                                <HoverEffect 
                                    items={formatUsersForHoverEffect(getFilteredAndSortedUsers())} 
                                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                                />
                            </div>
                        )}
                        {!isGridView && window.innerWidth > 768 && (
                            <>
                                <header className="grid grid-cols-5 items-center w-full border-b-2 border-b-white/40 pb-2">
                                    <div className="col-span-1 px-4 text-white font-bold flex items-center">
                                        Name
                                        <span onClick={() => handleSort('name')} className="ml-2 cursor-pointer text-white">
                                            {sortField === 'name' && sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                                        </span>
                                    </div>
                                    <div className="col-span-1 px-4 text-white font-bold flex items-center">
                                        Email
                                        <span onClick={() => handleSort('email')} className="ml-2 cursor-pointer text-white">
                                            {sortField === 'email' && sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                                        </span>
                                    </div>
                                    <div className="col-span-1 px-4 text-white font-bold flex items-center">
                                        Status
                                        <span onClick={() => handleSort('status')} className="ml-2 cursor-pointer text-white">
                                            {sortField === 'status' && sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
                                        </span>
                                    </div>
                                    <div className="col-span-1 px-4 text-white font-bold flex items-center">
                                        Hourly Rate
                                        <span onClick={() => handleSort('hourlyRate')} className="ml-2 cursor-pointer text-white">
                                            {sortField === 'hourlyRate' && sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                                        </span>
                                    </div>
                                    <div className="col-span-1 px-4 text-white font-bold text-right">
                                        Actions
                                    </div>
                                </header>

                                {getFilteredAndSortedUsers().map((user) => (
                                    <UserRow
                                        key={user._id}
                                        name={user.name}
                                        email={user.email}
                                        status={user.temporaryPassword ? 'Pending' : 'Active'}
                                        hourlyRate={user.hourlyRate}
                                        onEdit={() => handleEdit(user)}
                                        onDelete={() => handleDelete(user._id)}
                                        onResendEmail={() => handleResendEmail(user._id)}
                                    />
                                ))}
                            </>
                        )}
                    </section>;
                </>
            )}

            {showPopup && 
                <ConfirmationPopup 
                    user={users.find(user => user._id === selectedUser)}
                    onConfirm={confirmDelete} 
                    onCancel={() => setShowPopup(false)} 
                />
            }

            {editingUser && (
                <EditPopup
                    user={{
                        ...editFormData,
                        onChange: handleEditInputChange
                    }}
                    onSave={handleEditSubmit}
                    onCancel={() => setEditingUser(null)}
                />
            )}
        </div>
    );
}
