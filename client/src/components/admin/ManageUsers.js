// src/components/admin/ManageUsers.js
import React, { useState } from 'react';

// UserRow Component
const UserRow = ({ name, email, status, onEdit, onDelete }) => (
    <article className="grid grid-cols-4 items-center gap-4 w-full border-b-[1px] border-b-white/40">
        <div className="col-span-1 py-5 px-5 text-white truncate">{name}</div>
        <div className="col-span-1 py-5 px-5 text-white truncate">{email}</div>
        <div className="col-span-1 py-5 px-5 text-white">{status}</div>
        <div className="col-span-1 flex gap-2 py-5 px-5">
            <button onClick={onEdit} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full">
                Edit
            </button>
            <button onClick={onDelete} className="px-4 py-2 bg-red-700 hover:bg-red-900 text-white rounded-full">
                Delete
            </button>
        </div>
    </article>
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

export default function ManageUsers({ users, formData, handleInputChange, handleSubmit, showForm, setShowForm, handleEdit, handleDelete, showPopup, confirmDelete, setShowPopup }) {
    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-5">
                <h1 className="text-white text-2xl font-semibold whitespace-nowrap">Current Users:</h1>
                <div className="w-full flex justify-end">
                    {!showForm && (
                        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-white text-black hover:bg-gray-300 rounded-full transition duration-300 ease-in-out" style={{ width: '170px' }}>
                            <span className="mr-2">+</span> Add New User
                        </button>
                    )}
                    {showForm && (
                        <form className="flex items-center space-x-2 w-full justify-end transition-all duration-500 ease-in-out" onSubmit={handleSubmit}>
                            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required className="appearance-none border rounded py-2 px-3 text-black leading-tight focus:outline-none w-[20%] my-3" />
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required className="appearance-none border rounded py-2 px-3 text-black leading-tight focus:outline-none w-[30%]" />
                            <button type="submit" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-4 rounded-full my-0" style={{ height: '38px', width: '140px' }}>Create User</button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-red-700 hover:bg-red-900 text-white font-bold py-1 px-4 rounded-full my-0" style={{ height: '38px', width: '140px' }}>Cancel</button>
                        </form>
                    )}
                </div>
            </div>
            <section className="w-full flex flex-col items-center mb-10">
                <header className="grid grid-cols-4 items-center gap-4 w-full border-b-2 border-b-white/40 pb-2">
                    <div className="col-span-1 px-5 text-white font-bold">Name</div>
                    <div className="col-span-1 px-5 text-white font-bold">Email</div>
                    <div className="col-span-1 px-5 text-white font-bold">Status</div>
                    <div className="col-span-1 px-5 text-white font-bold">Actions</div>
                </header>
                {users.map((user) => (
                    <UserRow key={user._id} name={user.name} email={user.email} status={user.temporaryPassword ? 'Pending' : 'Active'} onEdit={() => handleEdit(user._id)} onDelete={() => handleDelete(user._id)} />
                ))}
            </section>
            {showPopup && <ConfirmationPopup onConfirm={confirmDelete} onCancel={() => setShowPopup(false)} />}
        </div>
    );
}
