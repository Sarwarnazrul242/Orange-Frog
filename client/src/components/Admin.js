import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackgroundWrapper from '../BackgroundWrapper';

// UserRow Component
const UserRow = ({ name, email, status, onEdit, onDelete }) => {
    return (
        <article className="grid grid-cols-4 items-center gap-4 w-full border-b-[1px] border-b-white/40">
            <div className="col-span-1 py-5 px-5 text-white truncate">{name}</div>
            <div className="col-span-1 py-5 px-5 text-white truncate">{email}</div>
            <div className="col-span-1 py-5 px-5 text-white">{status}</div>
            <div className="col-span-1 flex gap-2 py-5 px-5">
                <button
                    onClick={onEdit}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full"
                >
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-700 hover:bg-red-900 text-white rounded-full"
                >
                    Delete
                </button>
            </div>
        </article>
    );
};

// UserList Component
const UserList = ({ users, onEdit, onDelete }) => {
    return (
        <section className="w-full flex flex-col items-center mb-10">
            <header className="grid grid-cols-4 items-center gap-4 w-full border-b-2 border-b-white/40 pb-2">
                <div className="col-span-1 px-5 text-white font-bold">Name</div>
                <div className="col-span-1 px-5 text-white font-bold">Email</div>
                <div className="col-span-1 px-5 text-white font-bold">Status</div>
                <div className="col-span-1 px-5 text-white font-bold">Actions</div>
            </header>

            {users.map((user) => (
                <UserRow
                    key={user._id}
                    name={user.name}
                    email={user.email}
                    status={user.temporaryPassword ? 'Pending' : 'Active'}
                    onEdit={() => onEdit(user._id)}
                    onDelete={() => onDelete(user._id)}
                />
            ))}
        </section>
    );
};

// Confirmation Popup Component
const ConfirmationPopup = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
                <h2 className="text-red-600 text-2xl mb-4">Are you sure you want to delete this user?</h2>
                <p className="text-gray-700 mb-6">
                    This action cannot be undone. Once deleted, this user's data will be permanently removed from the system.
                </p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-full"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-700 hover:bg-red-900 text-white rounded-full"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// Admin Component
export default function Admin() {
    const [selectedMenu, setSelectedMenu] = useState('Create Event');
    const [formData, setFormData] = useState({
        eventName: '',
        eventLoadIn: '',
        eventLoadOut: '',
        eventLocation: '',
        eventDescription: '',
        name: '',
        email: ''
    });
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Fetch users from the backend
    useEffect(() => {
        axios.get('http://localhost:8000/users')
            .then((response) => setUsers(response.data))
            .catch((error) => console.error('Error fetching users:', error));
    }, []);

    // Handle input changes for form fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle form submission for event creation
    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = selectedMenu === 'Create Event' ? '/create-event' : '/create-user';

        try {
            const response = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(`${selectedMenu} created successfully!`);
                setFormData({
                    eventName: '',
                    eventLoadIn: '',
                    eventLoadOut: '',
                    eventLocation: '',
                    eventDescription: '',
                    name: '',
                    email: ''
                });
                if (selectedMenu === 'Current Users') {
                    setUsers([...users, result.user]);
                }
            } else {
                setMessage(result.message || 'Error creating entry');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Server error, please try again later');
        }
    };

    const handleEdit = (id) => {
        console.log(`Edit user with id: ${id}`);
    };

    const handleDelete = (id) => {
        setSelectedUser(id);
        setShowPopup(true);
    };

    const confirmDelete = () => {
        axios.delete(`http://localhost:8000/delete-user/${selectedUser}`)
            .then(() => {
                setUsers((prevUsers) => prevUsers.filter(user => user._id !== selectedUser));
                setShowPopup(false);
            })
            .catch((error) => console.error('Error deleting user:', error));
    };

    return (
        <BackgroundWrapper>
            <div className="flex flex-col h-screen md:flex-row p-5">
                {/* Sidebar Menu */}
                <div className="w-full h-auto mb-5 md:w-72 md:h-[500px] bg-gray-600/40 backdrop-blur-md p-5 rounded-xl md:mr-5 flex flex-col md:block justify-start overflow-x-auto md:overflow-visible border border-white/40 shadow-xl">
                    <h3 className="text-white mb-5 font-semibold">Admin Menu:</h3>
                    <ul className="flex md:block overflow-x-scroll md:overflow-visible scrollbar-hide">
                        <li
                            onClick={() => setSelectedMenu("Create Event")}
                            className={`px-4 py-2 rounded-full text-white whitespace-nowrap cursor-pointer ${selectedMenu === "Create Event" ? 'bg-white/10' : ''} hover:bg-white/10 transition duration-300`}
                        >
                            Create Event
                        </li>
                        <li
                            onClick={() => setSelectedMenu("Current Users")}
                            className={`px-4 py-2 rounded-full text-white whitespace-nowrap cursor-pointer ${selectedMenu === "Current Users" ? 'bg-white/10' : ''} hover:bg-white/10 transition duration-300`}
                        >
                            Manage Users
                        </li>
                    </ul>
                </div>

                {/* Main Content Card */}
                <div className="flex-1 h-auto md:h-[650px] bg-gray-600/40 backdrop-blur-md p-5 rounded-xl flex flex-col items-center border border-white/40 shadow-xl">
                    {/* <h1 className="self-start text-white text-2xl font-semibold mb-8">{selectedMenu}:</h1> */}

                    {/* Create Event Form */}
                    {selectedMenu === "Create Event" && (
                        <div className="w-full flex flex-col items-center">
                          <h1 className="self-start text-white text-2xl font-semibold mb-8">Event Creation:</h1>
                            <form className="space-y-4 w-[60%]" onSubmit={handleSubmit}>
                                {/* Event Name */}
                                <div className="flex flex-wrap -mx-3 mb-4">
                                    <div className="w-full px-3">
                                        <label className="block text-white text-sm font-bold mb-2">Event Name <span className="text-red-500">*</span></label>
                                        <input
                                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                            type="text"
                                            name="eventName"
                                            placeholder="Enter Event Name"
                                            value={formData.eventName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Load In and Load Out */}
                                <div className="flex flex-wrap -mx-3 mb-4">
                                    <div className="w-full md:w-1/2 px-3">
                                        <label className="block text-white text-sm font-bold mb-2">Load In <span className="text-red-500">*</span></label>
                                        <input
                                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                            type="datetime-local"
                                            name="eventLoadIn"
                                            value={formData.eventLoadIn}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="w-full md:w-1/2 px-3">
                                        <label className="block text-white text-sm font-bold mb-2">Load Out <span className="text-red-500">*</span></label>
                                        <input
                                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                            type="datetime-local"
                                            name="eventLoadOut"
                                            value={formData.eventLoadOut}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Location and Total Hours */}
                                <div className="flex flex-wrap -mx-3 mb-4">
                                    <div className="w-full md:w-1/2 px-3">
                                        <label className="block text-white text-sm font-bold mb-2">Location <span className="text-red-500">*</span></label>
                                        <input
                                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                            type="text"
                                            name="eventLocation"
                                            placeholder="Enter Event Location"
                                            value={formData.eventLocation}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="w-full md:w-1/2 px-3">
                                        <label className="block text-white text-sm font-bold mb-2">Total Hours</label>
                                        <input
                                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                            type="number"
                                            name="eventHours"
                                            placeholder="Enter Total Hours"
                                            value={formData.eventHours}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Job Description */}
                                <div className="flex flex-wrap -mx-3 mb-4">
                                    <div className="w-full px-3">
                                        <label className="block text-white text-sm font-bold mb-2">Job Description <span className="text-red-500">*</span></label>
                                        <textarea
                                            className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none"
                                            name="eventDescription"
                                            placeholder="Enter Job Description"
                                            rows="3"
                                            value={formData.eventDescription}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Centered Submit Button */}
                                <div className="flex justify-center">
                                    <button
                                        className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-full"
                                        type="submit"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                            {message && <p className="text-white mt-4">{message}</p>}
                        </div>
                    )}



                    {/* Current Users Page */}
                    {selectedMenu === "Current Users" && (
                        <div className="w-full flex flex-col items-center">
                            <div className="w-full flex items-center space-x-4 mb-8">
    {/* Heading */}
    <h1 className="text-white text-2xl font-semibold whitespace-nowrap">Manage Users:</h1>

    {/* Add New User Button */}
    {!showForm && (
        <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-white text-black hover:bg-gray-300 rounded-full transition duration-300 ease-in-out"
            style={{ width: '170px' }}
        >
            <span className="mr-2">+</span> Add New User
        </button>
    )}

    {/* Add New User Form */}
    {showForm && (
        <form
            className="flex items-center space-x-2 transition-all duration-500 ease-in-out"
            onSubmit={handleSubmit}
        >
            <input
                className="appearance-none border rounded py-2 px-3 text-black leading-tight focus:outline-none w-[20%]"
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
            />
            <input
                className="appearance-none border rounded py-2 px-3 text-black leading-tight focus:outline-none w-[30%]"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
            />
            <button
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-4 rounded-full"
                type="submit"
                style={{ height: '38px', width: '140px' }}
            >
                Create User
            </button>
            <button
                className="bg-red-700 hover:bg-red-900 text-white font-bold py-1 px-4 rounded-full"
                type="button"
                onClick={() => setShowForm(false)}
                style={{ height: '38px', width: '140px' }}
            >
                Cancel
            </button>
        </form>
    )}
</div>


                        <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />

                        {showPopup && (
                            <ConfirmationPopup
                                onConfirm={confirmDelete}
                                onCancel={() => setShowPopup(false)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    </BackgroundWrapper>
);
}

