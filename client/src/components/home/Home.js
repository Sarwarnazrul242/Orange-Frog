// src/components/home/Home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import BackgroundWrapper from '../../BackgroundWrapper';
import ChatRoom from './ChatRoom';
import JobBook from './JobBook';
import MyJobs from './MyJobs';
import Profile from './Profile';
import TimeCard from './TimeCard';
import IncidentReport from './IncidentReport';

export default function Home() {
    const navigate = useNavigate();
    const [selectedMenu, setSelectedMenu] = useState('Chat Room');
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        address: '',
        dob: '',
        phone: '',
        height: { feet: '', inches: '' },
        gender: '',
        allergies: [],
        password: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const isAuthenticated = Cookies.get('isAuthenticated');
        const email = Cookies.get('email');

        if (!isAuthenticated) {
            navigate('/');
        } else if (selectedMenu === "Profile") {
            axios.get(`http://localhost:8000/user-profile/${email}`)
                .then(response => {
                    const { name, email, address, dob, phone, height, gender, allergies } = response.data;
                    const formattedDob = dob ? new Date(dob).toISOString().split('T')[0] : '';
                    setProfileData({ name, email, address, dob: formattedDob, phone, height, gender, allergies });
                })
                .catch(error => console.error('Error fetching profile data:', error));
        }
    }, [navigate, selectedMenu]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "feet" || name === "inches") {
            setProfileData({ ...profileData, height: { ...profileData.height, [name]: value } });
        } else {
            setProfileData({ ...profileData, [name]: value });
        }
    };

    const menuComponents = {
        "Chat Room": <ChatRoom />,
        "Job Book": <JobBook />,
        "My Jobs": <MyJobs />,
        "Profile": <Profile profileData={profileData} setProfileData={setProfileData} handleInputChange={handleInputChange} message={message} setMessage={setMessage} />,
        "Time Card": <TimeCard />,
        "Incident Report": <IncidentReport />
    };

    return (
        <BackgroundWrapper>
            <div className="flex flex-col h-screen md:flex-row p-14">
                <div className="w-full h-auto mb-5 md:w-72 md:h-[500px] bg-gray-400/40 backdrop-blur-md p-5 rounded-xl md:ml-20 flex flex-col justify-start border border-white/40 shadow-xl">
                    <h3 className="text-white mb-5 font-semibold">My Stuff:</h3>
                    <ul className="flex md:block overflow-x-scroll md:overflow-visible scrollbar-hide">
                        {Object.keys(menuComponents).map(option => (
                            <li key={option} onClick={() => setSelectedMenu(option)} className={`px-4 py-2 rounded-full text-white whitespace-nowrap cursor-pointer ${selectedMenu === option ? 'bg-white/10' : ''} hover:bg-white/10 transition duration-300`}>{option}</li>
                        ))}
                    </ul>
                </div>
                <div className="flex-1 md:max-w-6xl ml-auto h-auto md:h-[750px] bg-gray-400/40 backdrop-blur-md p-10 rounded-xl flex flex-col items-center justify-center border border-white/40 shadow-xl overflow-y-auto max-h-full">
                    <h1 className="text-white text-3xl font-semibold mb-6">{selectedMenu}</h1>
                    <div className="w-full overflow-y-auto max-h-full flex items-center justify-center">
                        {menuComponents[selectedMenu]}
                    </div>
                </div>
            </div>
        </BackgroundWrapper>
    );
}