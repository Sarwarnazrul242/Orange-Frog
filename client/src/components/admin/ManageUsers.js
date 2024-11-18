// src/components/admin/ManageUsers.js
import React, { useState, useEffect, useRef } from 'react';
import { FaTh, FaList, FaEdit, FaTrashAlt, FaRedo, FaSortAlphaDown, FaSortAlphaUp, FaSearch, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import autoAnimate from '@formkit/auto-animate';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';


const UserRow = ({ name, email, status, onEdit, onDelete, onResendEmail }) => (
    <article className="grid grid-cols-4 items-center gap-4 w-full border-b-[1px] border-b-white/40 relative">
        <div className="col-span-1 py-5 px-5 text-white truncate">{name}</div>
        <div className="col-span-1 py-5 px-5 text-white truncate">{email}</div>
        <div className="col-span-1 py-5 px-5 text-white">{status}</div>
        <div className="col-span-1 flex gap-2 py-5 px-5 relative">
            {status === 'Pending' && (
                <div className="absolute left-0 transform -translate-x-full">
                    <button onClick={onResendEmail} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center" title="Resend Email">
                        <FaRedo className="mr-1" />
                    </button>
                </div>
            )}
            <button onClick={onEdit} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center">
                <FaEdit className="mr-1" /> Edit
            </button>
            <button onClick={onDelete} className="px-4 py-2 bg-red-700 hover:bg-red-900 text-white rounded-full flex items-center">
                <FaTrashAlt className="mr-1" /> Delete
            </button>
        </div>
    </article>
);


const UserCard = ({ name, email, status, onEdit, onDelete, onResendEmail }) => (
    <div className="relative bg-gray-800 p-5 rounded-lg text-center text-white shadow-lg w-full h-full flex flex-col justify-between">
        {status === 'Pending' && (
            <button
                onClick={onResendEmail}
                className="absolute top-0 mt-2 right-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center " title="Resend Email"
            >
                <FaRedo className="text-sm" />
            </button>
        )}

        <div>
            <h3 className="text-xl font-semibold mb-2">{name}</h3>
            <p className="truncate">{email}</p>
            <p className="my-2">{status}</p>
        </div>
        <div className="flex justify-center gap-2 mt-4">
            <button onClick={onEdit} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center">
                <FaEdit className="mr-1" /> Edit
            </button>
            <button onClick={onDelete} className="px-4 py-2 bg-red-700 hover:bg-red-900 text-white rounded-full flex items-center">
                <FaTrashAlt className="mr-1" /> Delete
            </button>
        </div>
    </div>
);

const ConfirmationPopup = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
            <h2 className="text-red-600 text-2xl mb-4">Are you sure you want to delete this user?</h2>
            <p className="text-gray-700 mb-6">This action cannot be undone. Once deleted, this user's data will be permanently removed from the system.</p>
            <div className="flex justify-end gap-4">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-full">Cancel</button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-700 hover:bg-red-900 text-white rounded-full">Delete</button>
            </div>
        </div>
    </div>
);

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [buttonState, setButtonState] = useState("Create User");
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editFormData, setEditFormData] = useState({ name: "", email: "" });
    const [showPopup, setShowPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isGridView, setIsGridView] = useState(false);
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
            const response = await axios.get("http://localhost:8000/users");
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setLoading(false);
        }
    };

    const handleResendEmail = async (userId) => {
        try {
            await axios.post(`http://localhost:8000/resend-email/${userId}`);
            toast.success('Email resent successfully!');
        } catch (error) {
            console.error("Error resending email:", error);
            toast.error('Failed to resend email');
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setButtonState("Loading...");
        try {
            const newUser = { name: editFormData.name, email: editFormData.email };
            const response = await axios.post("http://localhost:8000/create-user", newUser);
            if (response.status === 200) {
                setUsers([...users, response.data.user]);
                setButtonState("Created");
                setEditFormData({ name: "", email: "" });
                setTimeout(() => {
                    setButtonState("Create User");
                    setShowForm(false);
                }, 2000);
            }
        } catch (error) {
            console.error("Error creating user:", error);
            setButtonState("Create User");
        }
    };

    const handleDelete = (id) => {
        setSelectedUser(id);
        setShowPopup(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/delete-user/${selectedUser}`);
            setUsers(users.filter(user => user._id !== selectedUser));
            setShowPopup(false);
            toast.success('User deleted successfully!');
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error('Failed to delete user');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditFormData(user);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:8000/update-user/${editingUser._id}`, editFormData);
            if (response.status === 200) {
                setUsers(users.map(user => (user._id === editingUser._id ? response.data : user)));
                setEditingUser(null);
                toast.success('User updated successfully!');
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error('Failed to update user information');
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
            const aValue = a[sortField].toLowerCase();
            const bValue = b[sortField].toLowerCase();

            if (sortDirection === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3">
                <h1 className="text-white text-2xl font-semibold">Current Users:</h1>
                <div ref={formParent}>
                    {!showForm && !editingUser && (
                        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-white text-black hover:bg-gray-300 rounded-full transition duration-300 ease-in-out" style={{ width: '170px' }}>
                            <span className="mr-2">+</span> Add New User
                        </button>
                    )}
{showForm && (
    <motion.form
        className="flex items-center space-x-4 w-full justify-end"
        onSubmit={handleFormSubmit}
        initial={{ x: "100%", opacity: 0 }} // Slide in from the right with opacity
        animate={{ x: 0, opacity: 1 }} // Animate to its original position with full opacity
        exit={{ opacity: 0 }} // Fade out on exit (no slide out)
        transition={{ type: "spring", stiffness: 300, damping: 30 }} // Smooth spring effect
    >
        <div className="flex flex-col w-[30%]">
            <label htmlFor="name" className="text-white mb-1">Name</label>
            <input
                type="text"
                id="name"
                name="name"
                placeholder="Name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                required
                className="appearance-none border rounded py-2 px-3 text-black leading-tight focus:outline-none"
            />
        </div>
        <div className="flex flex-col w-[50%]">
            <label htmlFor="email" className="text-white mb-1">Email</label>
            <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={editFormData.email}
                onChange={handleEditInputChange}
                required
                className="appearance-none border rounded py-2 px-3 text-black leading-tight focus:outline-none"
            />
        </div>
        <div className="flex items-center space-x-2 mt-2">
            <button
                type="submit"
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-4 rounded-full"
                style={{ height: '38px', width: '140px' }}
            >
                {buttonState === "Loading..." ? (
                    <div className="flex items-center space-x-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
                        <span>{buttonState}</span>
                    </div>
                ) : (
                    buttonState
                )}
            </button>
            <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-red-700 hover:bg-red-900 text-white font-bold py-1 px-4 rounded-full"
                style={{ height: '38px', width: '140px' }}
            >
                Cancel
            </button>
        </div>
    </motion.form>
)}

                </div>
            </div>

            {editingUser && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-md shadow-lg max-w-2xl w-full">
                        <h2 className="text-2xl mb-4">Edit User</h2>
                        <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-8">
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editFormData.name}
                                    className="w-full p-3 border rounded-md"
                                    readOnly
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border rounded-md bg-white"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-gray-700 mb-2">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={editFormData.address || ''}
                                    className="w-full p-3 border rounded-md"
                                    readOnly
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={editFormData.phone || ''}
                                    className="w-full p-3 border rounded-md"
                                    readOnly
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={editFormData.dob || ''}
                                    className="w-full p-3 border rounded-md"
                                    readOnly
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">T-Shirt Size</label>
                                <select
                                    name="shirtSize"
                                    value={editFormData.shirtSize || ''}
                                    className="w-full p-3 border rounded-md"
                                    disabled
                                >
                                    <option value="">Select Size</option>
                                    <option value="XS">XS</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="2XL">2XL</option>
                                    <option value="3XL">3XL</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">First Aid Certified</label>
                                <select
                                    name="firstAidCert"
                                    value={editFormData.firstAidCert || ''}
                                    className="w-full p-3 border rounded-md"
                                    disabled
                                >
                                    <option value="">Select Option</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-gray-700 mb-2">Allergies</label>
                                <ul className="list-disc list-inside text-gray-700">
                                    {editFormData.allergies?.length > 0 ? (
                                        editFormData.allergies.map((allergy, index) => (
                                            <li key={index}>{allergy}</li>
                                        ))
                                    ) : (
                                        <li>No allergies listed</li>
                                    )}
                                </ul>
                            </div>
                            <div className="col-span-2 flex justify-center mt-4">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-gray-500 text-white rounded-full mr-4">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-black text-white rounded-full">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="w-full flex items-center mb-5">
                <div className="flex space-x-2">
                    <button onClick={() => setIsGridView(false)} className={`px-4 py-2 ${!isGridView ? 'bg-gray-300': 'bg-gray-500'} text-white rounded-l-full flex items-center mt-0`}>
                        <FaList className="mr-1" />
                    </button>
                    <button onClick={() => setIsGridView(true)} className={`px-4 py-2 ${isGridView ? 'bg-gray-300' : 'bg-gray-500'} text-white rounded-r-full flex items-center mt-0 `}>
                        <FaTh className="mr-1" />
                    </button>
                    <span onClick={() => setShowSearchBox(!showSearchBox)} className="cursor-pointer text-white flex items-center mt-0 px-2"> 
                        <FaSearch />
                    </span>

                    {showSearchBox && ( // Show search input box if search is active
                        <input
                            type="text"
                            placeholder="Search by name"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="px-3 py-2 rounded-full bg-gray-700 text-white outline-none"
                        />
                    )}
                </div>
            </div>

            
            <section className="w-full flex flex-col items-center mb-10">
                {isGridView && !editingUser && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                        {getFilteredAndSortedUsers().map(user => (
                            <UserCard
                                key={user._id}
                                name={user.name}
                                email={user.email}
                                status={user.temporaryPassword ? 'Pending' : 'Active'}
                                onEdit={() => handleEdit(user)}
                                onDelete={() => handleDelete(user._id)}
                                onResendEmail={() => handleResendEmail(user._id)}
                            />
                        ))}
                    </div>
                )}
                {!isGridView && !editingUser && (
                    <>
                        <header className="grid grid-cols-4 items-center gap-4 w-full border-b-2 border-b-white/40 pb-2">
                            <div className="col-span-1 px-5 text-white font-bold flex items-center">
                                Name
                                <span onClick={() => handleSort('name')} className="ml-2 cursor-pointer text-white">
                                    {sortField === 'name' && sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                                </span>
                            </div>
                            <div className="col-span-1 px-5 text-white font-bold flex items-center">
                                Email
                                <span onClick={() => handleSort('email')} className="ml-2 cursor-pointer text-white">
                                    {sortField === 'email' && sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
                                </span>
                            </div>
                            <div className="col-span-1 px-5 text-white font-bold flex items-center">
                                Status
                                <span onClick={() => handleSort('status')} className="ml-2 cursor-pointer text-white">
                                    {sortField === 'status' && sortDirection === 'asc' ?  <FaArrowUp /> : <FaArrowDown />}
                                </span>
                            </div>

                            <div className="col-span-1 px-5 text-white font-bold">Actions</div>
                        </header>

                        {getFilteredAndSortedUsers().map(user => (
                            <UserRow
                                key={user._id}
                                name={user.name}
                                email={user.email}
                                status={user.temporaryPassword ? 'Pending' : 'Active'}
                                onEdit={() => handleEdit(user)}
                                onDelete={() => handleDelete(user._id)}
                                onResendEmail={() => handleResendEmail(user._id)}
                            />
                        ))}
                    </>
                )}
            </section>
            {showPopup && <ConfirmationPopup onConfirm={confirmDelete} onCancel={() => setShowPopup(false)} />}
        </div>
    );
}
