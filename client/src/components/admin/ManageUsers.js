// src/components/admin/ManageUsers.js
import React, { useState, useEffect, useRef } from 'react';
import { FaTh, FaList, FaEdit, FaTrashAlt } from 'react-icons/fa';
import autoAnimate from '@formkit/auto-animate';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// UserRow Component
const UserRow = ({ name, email, status, onEdit, onDelete }) => (
    <article className="grid grid-cols-4 items-center gap-4 w-full border-b-[1px] border-b-white/40">
        <div className="col-span-1 py-5 px-5 text-white truncate">{name}</div>
        <div className="col-span-1 py-5 px-5 text-white truncate">{email}</div>
        <div className="col-span-1 py-5 px-5 text-white">{status}</div>
        <div className="col-span-1 flex gap-2 py-5 px-5">
            <button onClick={onEdit} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center">
                <FaEdit className="mr-1" /> Edit
            </button>
            <button onClick={onDelete} className="px-4 py-2 bg-red-700 hover:bg-red-900 text-white rounded-full flex items-center">
                <FaTrashAlt className="mr-1" /> Delete
            </button>
        </div>
    </article>
);

// UserCard Component for Grid View
const UserCard = ({ name, email, status, onEdit, onDelete }) => (
    <div className="bg-gray-800 p-5 rounded-lg text-center text-white shadow-lg w-full h-full flex flex-col justify-between">
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

// Confirmation Popup Component
const ConfirmationPopup = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
            <h2 className="text-red-600 text-2xl mb-4">Are you sure you want to delete this user?</h2>
            <p className="text-gray-700 mb-6">
                This action cannot be undone. Once deleted, this user's data will be permanently removed from the system.
            </p>
            <div className="flex justify-end gap-4">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-full">
                    Cancel
                </button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-700 hover:bg-red-900 text-white rounded-full">
                    Delete
                </button>
            </div>
        </div>
    </div>
);

export default function ManageUsers({ formData, handleInputChange, handleSubmit, showForm, setShowForm, handleDelete, showPopup, confirmDelete, setShowPopup }) {
    const [isGridView, setIsGridView] = useState(false);
    const [users, setUsers] = useState([]);
    const [buttonState, setButtonState] = useState("Create User");
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const formParent = useRef(null);

    useEffect(() => {
        formParent.current && autoAnimate(formParent.current);
    }, [formParent]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:8000/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setButtonState("Loading...");

        setTimeout(() => {
            setButtonState("Created");
            setTimeout(() => {
                setButtonState("Create User");
            }, 3000);
        }, 1500);

        handleSubmit(e);
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
                const updatedUsers = users.map((user) => (user._id === editingUser._id ? response.data : user));
                setUsers(updatedUsers);
                setEditingUser(null);
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
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
                    <AnimatePresence>
                        {showForm && (
                            <motion.form
                                className="flex items-center space-x-4 w-full justify-end transition-all duration-500 ease-in-out"
                                onSubmit={handleFormSubmit}
                                initial={{ opacity: 0, x: '100%' }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: '100%' }}
                            >
                                <div className="flex flex-col w-[30%]">
                                    <label htmlFor="name" className="text-white mb-1">Name</label>
                                    <input type="text" id="name" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required className="appearance-none border rounded py-2 px-3 text-black leading-tight focus:outline-none" />
                                </div>
                                <div className="flex flex-col w-[50%]">
                                    <label htmlFor="email" className="text-white mb-1">Email</label>
                                    <input type="email" id="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required className="appearance-none border rounded py-2 px-3 text-black leading-tight focus:outline-none" />
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                    <button type="submit" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-4 rounded-full" style={{ height: '38px', width: '140px' }}>
                                        {buttonState === "Loading..." ? (
                                            <div className="flex items-center space-x-2">
                                                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
                                                <span>{buttonState}</span>
                                            </div>
                                        ) : (
                                            buttonState
                                        )}
                                    </button>
                                    <button type="button" onClick={() => setShowForm(false)} className="bg-red-700 hover:bg-red-900 text-white font-bold py-1 px-4 rounded-full" style={{ height: '38px', width: '140px' }}>Cancel</button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
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
                                <label className="block text-gray-700 mb-2">Height (ft/in)</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        name="feet"
                                        value={editFormData.height?.feet || ''}
                                        className="w-1/2 p-3 border rounded-md text-center"
                                        placeholder="ft"
                                        readOnly
                                    />
                                    <input
                                        type="text"
                                        name="inches"
                                        value={editFormData.height?.inches || ''}
                                        className="w-1/2 p-3 border rounded-md text-center"
                                        placeholder="in"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-2">Gender</label>
                                <select
                                    name="gender"
                                    value={editFormData.gender}
                                    className="w-full p-3 border rounded-md"
                                    disabled
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
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
                    <button onClick={() => setIsGridView(false)} className={`px-4 py-2 ${!isGridView ? 'bg-gray-500' : 'bg-gray-300'} text-white rounded-l-full flex items-center`}>
                        <FaList className="mr-1" />
                    </button>
                    <button onClick={() => setIsGridView(true)} className={`px-4 py-2 ${isGridView ? 'bg-gray-500' : 'bg-gray-300'} text-white rounded-r-full flex items-center`}>
                        <FaTh className="mr-1" />
                    </button>
                </div>
            </div>

            <section className="w-full flex flex-col items-center mb-10">
                {!isGridView && !editingUser && (
                    <>
                        <header className="grid grid-cols-4 items-center gap-4 w-full border-b-2 border-b-white/40 pb-2">
                            <div className="col-span-1 px-5 text-white font-bold">Name</div>
                            <div className="col-span-1 px-5 text-white font-bold">Email</div>
                            <div className="col-span-1 px-5 text-white font-bold">Status</div>
                            <div className="col-span-1 px-5 text-white font-bold">Actions</div>
                        </header>
                        {users.map((user) => (
                            <UserRow key={user._id} name={user.name} email={user.email} status={user.temporaryPassword ? 'Pending' : 'Active'} onEdit={() => handleEdit(user)} onDelete={() => handleDelete(user._id)} />
                        ))}
                    </>
                )}
                {isGridView && !editingUser && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                        {users.map((user) => (
                            <UserCard key={user._id} name={user.name} email={user.email} status={user.temporaryPassword ? 'Pending' : 'Active'} onEdit={() => handleEdit(user)} onDelete={() => handleDelete(user._id)} />
                        ))}
                    </div>
                )}
            </section>
            {showPopup && <ConfirmationPopup onConfirm={confirmDelete} onCancel={() => setShowPopup(false)} />}
        </div>
    );
}
