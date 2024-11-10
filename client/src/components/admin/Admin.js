// src/components/admin/Admin.js
import React, { useState } from 'react';
import BackgroundWrapper from '../../BackgroundWrapper';
import CreateEvent from './CreateEvent';
import ManageUsers from './ManageUsers';
import ViewEvent from './ViewEvent';

export default function Admin() {
    const [selectedMenu, setSelectedMenu] = useState('Create Event');

    return (
        <BackgroundWrapper>
            <div className="flex flex-col h-screen md:flex-row p-5 ml-24 mr-8">
                <div className="w-full h-auto mb-5 md:w-72 md:h-[500px] bg-gray-400/40 backdrop-blur-md p-5 rounded-xl md:mr-5 flex flex-col justify-start border border-white/40 shadow-xl">
                    <h3 className="text-white mb-5 font-semibold">Admin Menu:</h3>
                    <ul className="flex md:block overflow-x-scroll md:overflow-visible scrollbar-hide">
                        <li onClick={() => setSelectedMenu("Create Event")} className={`px-4 py-2 mb-2 rounded-full text-white whitespace-nowrap cursor-pointer ${selectedMenu === "Create Event" ? 'bg-white/10' : ''} hover:bg-white/10 transition duration-300`}>Create Event</li>
                        <li onClick={() => setSelectedMenu("Manage Users")} className={`px-4 py-2 mb-2 rounded-full text-white whitespace-nowrap cursor-pointer ${selectedMenu === "Manage Users" ? 'bg-white/10' : ''} hover:bg-white/10 transition duration-300`}>Manage Users</li>
                        <li onClick={() => setSelectedMenu("View Event")} className={`px-4 py-2 mb-2 rounded-full text-white whitespace-nowrap cursor-pointer ${selectedMenu === "View Event" ? 'bg-white/10' : ''} hover:bg-white/10 transition duration-300`}>View Event</li>
                    </ul>
                </div>

                <div className="flex-1 h-auto md:h-[800px] bg-gray-400/40 backdrop-blur-md p-5 rounded-xl flex flex-col items-center border border-white/40 shadow-xl overflow-y-auto max-h-[800px]">
                    {selectedMenu === "Create Event" && <CreateEvent />}
                    {selectedMenu === "Manage Users" && <ManageUsers />}
                    {selectedMenu === "View Event" && <ViewEvent />}
                </div>
            </div>
        </BackgroundWrapper>
    );
}
