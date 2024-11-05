// src/components/home/TimeCard.js
import React, { useState, useEffect } from 'react';
import { FaClock, FaSignOutAlt, FaCoffee, FaPause } from 'react-icons/fa';

export default function TimeCard() {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [lastActivity, setLastActivity] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [timeline, setTimeline] = useState([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const addToTimeline = (activity, time) => {
        setTimeline((prevTimeline) => [
            ...prevTimeline,
            { activity, time: formatDateTime(time) }
        ]);
    };

    const handleClockIn = () => {
        setIsClockedIn(true);
        const now = new Date();
        setLastActivity(`Clocked in at ${formatDateTime(now)}`);
        addToTimeline("Clock In", now);
    };

    const handleClockOut = () => {
        setIsClockedIn(false);
        setIsOnBreak(false);
        const now = new Date();
        setLastActivity(`Clocked out at ${formatDateTime(now)}`);
        addToTimeline("Clock Out", now);
    };

    const handleStartBreak = () => {
        setIsOnBreak(true);
        const now = new Date();
        setLastActivity(`Started break at ${formatDateTime(now)}`);
        addToTimeline("Break Start", now);
    };

    const handleEndBreak = () => {
        setIsOnBreak(false);
        const now = new Date();
        setLastActivity(`Ended break at ${formatDateTime(now)}`);
        addToTimeline("Break End", now);
    };

    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const formattedDate = `${currentTime.toLocaleDateString()}, ${currentTime.toLocaleDateString('en-US', { weekday: 'long' })}`;

    return (
        <div className="flex gap-20 mt-10">
            {/* Time Card Information */}
            <div className="text-left w-1/2">
                <div className="text-white mb-6">
                    <div className="text-6xl font-semibold mb-1">{formattedTime}</div>
                    <div className="text-lg">{formattedDate}</div>
                </div>
                <div className="mb-4">
                    <p className="text-white text-md">{lastActivity}</p>
                </div>
                {!isClockedIn && (
                    <button
                        onClick={handleClockIn}
                        className="bg-black text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 mb-3 w-[200px]"
                    >
                        <FaClock /> Clock In
                    </button>
                )}
                {isClockedIn && (
                    <>
                        {!isOnBreak && (
                            <button
                                onClick={handleClockOut}
                                className="bg-black text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 mb-3 w-[200px]"
                            >
                                <FaSignOutAlt /> Clock Out
                            </button>
                        )}
                        {!isOnBreak ? (
                            <button
                                onClick={handleStartBreak}
                                className="bg-black text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 mb-3 w-[200px]"
                            >
                                <FaCoffee /> Start Break
                            </button>
                        ) : (
                            <button
                                onClick={handleEndBreak}
                                className="bg-black text-white px-4 py-2 rounded-full flex items-center justify-center gap-2 w-[200px]"
                            >
                                <FaPause /> End Break
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Activity Timeline */}
            <div className="w-1/2 text-left">
                <h3 className="text-2xl font-bold text-white mb-4">Activity Timeline</h3>
                <div className="border-l-2 border-gray-400 pl-4">
                    {timeline.length > 0 ? (
                        timeline.map((entry, index) => (
                            <div key={index} className="mb-6">
                                <div className="flex items-center">
                                    <span className="bg-gray-400 rounded-full h-4 w-4 mr-3"></span>
                                    <span className="text-white font-semibold">{entry.activity}</span>
                                </div>
                                <div className="ml-7 text-gray-300 text-sm">{entry.time}</div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400">No activity recorded</p>
                    )}
                </div>
            </div>
        </div>
    );
}
