// src/components/home/TimeCard.js
import React, { useState, useEffect } from 'react';
import { FaClock, FaSignOutAlt, FaCoffee, FaPause } from 'react-icons/fa';

export default function TimeCard() {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [lastActivity, setLastActivity] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => {
        return `${date.toLocaleTimeString()} on ${date.toLocaleDateString()}`;
    };

    const handleClockIn = () => {
        setIsClockedIn(true);
        setLastActivity(`Clocked in at ${formatDateTime(new Date())}`);
    };

    const handleClockOut = () => {
        setIsClockedIn(false);
        setIsOnBreak(false);
        setLastActivity(`Clocked out at ${formatDateTime(new Date())}`);
    };

    const handleStartBreak = () => {
        setIsOnBreak(true);
        setLastActivity(`Started break at ${formatDateTime(new Date())}`);
    };

    const handleEndBreak = () => {
        setIsOnBreak(false);
        setLastActivity(`Ended break at ${formatDateTime(new Date())}`);
    };

    const formattedTime = currentTime.toLocaleTimeString();
    const formattedDate = `${currentTime.toLocaleDateString()}, ${currentTime.toLocaleDateString('en-US', { weekday: 'long' })}`;

    return (
        <div className="text-center mt-10">
            <h2 className="text-4xl font-bold text-white mb-4">Time Card</h2>
            <div className="text-white">
                <div className="text-6xl font-semibold mb-1">{formattedTime}</div>
                <div className="text-lg mb-6">{formattedDate}</div>
            </div>
            <div className="mb-4">
                <p className="text-white text-md">{lastActivity}</p>
            </div>
            {!isClockedIn && (
                <button
                    onClick={handleClockIn}
                    className="bg-black text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 mb-3 w-[200px] mx-auto"
                >
                    <FaClock /> Clock In
                </button>
            )}
            {isClockedIn && (
                <>
                    {!isOnBreak && (
                        <button
                            onClick={handleClockOut}
                            className="bg-black text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 mb-3 w-[200px] mx-auto"
                        >
                            <FaSignOutAlt /> Clock Out
                        </button>
                    )}
                    {!isOnBreak ? (
                        <button
                            onClick={handleStartBreak}
                            className="bg-black text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 mb-3 w-[200px] mx-auto"
                        >
                            <FaCoffee /> Start Break
                        </button>
                    ) : (
                        <button
                            onClick={handleEndBreak}
                            className="bg-black text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 w-[200px] mx-auto"
                        >
                            <FaPause /> End Break
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
