// src/components/admin/Admin.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackgroundWrapper from '../../BackgroundWrapper';
import CreateEvent from './CreateEvent';
import ManageUsers from './ManageUsers';
import ViewEvent from './ViewEvent';

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

    useEffect(() => {
        axios.get('http://localhost:8000/users')
            .then((response) => setUsers(response.data))
            .catch((error) => console.error('Error fetching users:', error));
    }, []);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = selectedMenu === 'Create Event' ? '/create-event' : '/create-user';

        try {
            const response = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();

            if (response.ok) {
                setMessage(`${selectedMenu} created successfully!`);
                setFormData({ eventName: '', eventLoadIn: '', eventLoadOut: '', eventLocation: '', eventDescription: '', name: '', email: '' });
                if (selectedMenu === 'Manage Users') setUsers([...users, result.user]);
            } else {
                setMessage(result.message || 'Error creating entry');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Server error, please try again later');
        }
    };

    const handleEdit = (id) => console.log(`Edit user with id: ${id}`);
    const handleDelete = (id) => { setSelectedUser(id); setShowPopup(true); };
    const confirmDelete = () => {
        axios.delete(`http://localhost:8000/delete-user/${selectedUser}`)
            .then(() => {
                setUsers(users.filter(user => user._id !== selectedUser));
                setShowPopup(false);
            })
            .catch((error) => console.error('Error deleting user:', error));
    };

    return (
        <BackgroundWrapper>
            <div className="flex flex-col h-screen md:flex-row p-5">
                <div className="w-full h-auto mb-5 md:w-72 md:h-[500px] bg-gray-400/40 backdrop-blur-md p-5 rounded-xl md:mr-5 flex flex-col justify-start border border-white/40 shadow-xl">
                    <h3 className="text-white mb-5 font-semibold">Admin Menu:</h3>
                    <ul className="flex md:block overflow-x-scroll md:overflow-visible scrollbar-hide">
                        <li onClick={() => setSelectedMenu("Create Event")} className={`px-4 py-2 mb-2 rounded-full text-white whitespace-nowrap cursor-pointer ${selectedMenu === "Create Event" ? 'bg-white/10' : ''} hover:bg-white/10 transition duration-300`}>Create Event</li>
                        <li onClick={() => setSelectedMenu("Manage Users")} className={`px-4 py-2 mb-2 rounded-full text-white whitespace-nowrap cursor-pointer ${selectedMenu === "Manage Users" ? 'bg-white/10' : ''} hover:bg-white/10 transition duration-300`}>Manage Users</li>
                        <li onClick={() => setSelectedMenu("View Event")} className={`px-4 py-2 mb-2 rounded-full text-white whitespace-nowrap cursor-pointer ${selectedMenu === "View Event" ? 'bg-white/10' : ''} hover:bg-white/10 transition duration-300`}>View Event</li>
                    </ul>
                </div>

                <div className="flex-1 h-auto md:h-[650px] bg-gray-400/40 backdrop-blur-md p-5 rounded-xl flex flex-col items-center border border-white/40 shadow-xl overflow-y-auto max-h-[650px]">
                    {selectedMenu === "Create Event" && (
                        <CreateEvent formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} message={message} />
                    )}
                    {selectedMenu === "Manage Users" && (
                        <ManageUsers users={users} formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} showForm={showForm} setShowForm={setShowForm} handleEdit={handleEdit} handleDelete={handleDelete} showPopup={showPopup} confirmDelete={confirmDelete} setShowPopup={setShowPopup} />
                    )}
                    {selectedMenu === "View Event" && (
                        <ViewEvent />
                    )}
                </div>
            </div>
        </BackgroundWrapper>
    );
}
