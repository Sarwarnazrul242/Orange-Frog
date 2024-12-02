import React, { useState, useEffect } from 'react';
import { FaClock, FaSignOutAlt, FaCoffee, FaPause, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function TimeCard() {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [lastActivity, setLastActivity] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [timeline, setTimeline] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

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

    const formattedTime = currentTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
    });
    
    const formattedDate = currentTime.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];
        const today = new Date();

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <div 
                    key={`empty-${i}`} 
                    className="h-14 border border-neutral-800/20"
                />
            );
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isPast = date < today;

            days.push(
                <motion.div
                    key={day}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(date)}
                    className={`
                        h-14 flex flex-col items-center justify-center rounded-lg cursor-pointer
                        border border-neutral-800/20 transition-all duration-200
                        ${isToday ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : ''}
                        ${isSelected ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : ''}
                        ${!isToday && !isSelected ? 'hover:bg-neutral-700/30 hover:border-neutral-700' : ''}
                        ${isPast && !isToday && !isSelected ? 'opacity-50' : ''}
                    `}
                >
                    <span className={`
                        text-lg font-medium
                        ${isToday ? 'text-blue-400' : ''}
                        ${isSelected ? 'text-green-400' : ''}
                        ${!isToday && !isSelected ? 'text-neutral-400' : ''}
                    `}>
                        {day}
                    </span>
                    {isToday && (
                        <span className="text-xs text-blue-400 mt-1">Today</span>
                    )}
                </motion.div>
            );
        }

        return days;
    };

    return (
        <div className="flex flex-col w-full min-h-screen p-8 bg-neutral-900">
            <Link 
                to="/user/dashboard"
                className="mb-8 flex items-center text-neutral-400 hover:text-white transition-colors"
            >
                <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path d="M15 19l-7-7 7-7" />
                </svg>
                Return to Dashboard
            </Link>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Calendar Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full lg:w-1/3 bg-neutral-800/50 p-8 rounded-xl shadow-xl backdrop-blur-sm border border-neutral-700/50"
                >
                    <div className="flex justify-between items-center mb-8">
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-neutral-700/50 rounded-full transition-colors"
                        >
                            <FaChevronLeft className="text-neutral-400 w-5 h-5" />
                        </motion.button>
                        <h2 className="text-2xl font-bold text-white bg-neutral-700/30 px-4 py-2 rounded-full">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-neutral-700/50 rounded-full transition-colors"
                        >
                            <FaChevronRight className="text-neutral-400 w-5 h-5" />
                        </motion.button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div 
                                key={day} 
                                className="h-10 flex items-center justify-center text-neutral-500 text-sm font-medium bg-neutral-800/30 rounded-lg"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {renderCalendar()}
                    </div>

                    <div className="mt-6 flex justify-center space-x-4 text-sm">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/50 mr-2"></div>
                            <span className="text-neutral-400">Today</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50 mr-2"></div>
                            <span className="text-neutral-400">Selected</span>
                        </div>
                    </div>
                </motion.div>

                {/* Time Card Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full lg:w-1/3 bg-neutral-800/50 p-8 rounded-xl shadow-xl"
                >
                    <div className="text-center mb-8">
                        <motion.div 
                            className="text-6xl font-bold text-white mb-2"
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            {formattedTime}
                        </motion.div>
                        <div className="text-xl text-neutral-400">{formattedDate}</div>
                    </div>

                    <AnimatePresence mode='wait'>
                        <motion.div 
                            key={lastActivity}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="text-center mb-8 text-neutral-300"
                        >
                            {lastActivity}
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex flex-col items-center gap-4">
                        {!isClockedIn ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClockIn}
                                className="w-full max-w-xs bg-green-500/20 text-green-500 px-6 py-3 rounded-full flex items-center justify-center gap-3 hover:bg-green-500/30 transition-colors"
                            >
                                <FaClock /> Clock In
                            </motion.button>
                        ) : (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleClockOut}
                                    className="w-full max-w-xs bg-red-500/20 text-red-500 px-6 py-3 rounded-full flex items-center justify-center gap-3 hover:bg-red-500/30 transition-colors"
                                >
                                    <FaSignOutAlt /> Clock Out
                                </motion.button>
                                {!isOnBreak ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleStartBreak}
                                        className="w-full max-w-xs bg-yellow-500/20 text-yellow-500 px-6 py-3 rounded-full flex items-center justify-center gap-3 hover:bg-yellow-500/30 transition-colors"
                                    >
                                        <FaCoffee /> Start Break
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleEndBreak}
                                        className="w-full max-w-xs bg-blue-500/20 text-blue-500 px-6 py-3 rounded-full flex items-center justify-center gap-3 hover:bg-blue-500/30 transition-colors"
                                    >
                                        <FaPause /> End Break
                                    </motion.button>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Timeline Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-1/3 bg-neutral-800/50 p-8 rounded-xl shadow-xl"
                >
                    <h3 className="text-2xl font-bold text-white mb-6">Activity Timeline</h3>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {timeline.length > 0 ? (
                                timeline.map((entry, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative pl-6 pb-4 border-l-2 border-neutral-700"
                                    >
                                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-neutral-700" />
                                        <div className="font-semibold text-white">{entry.activity}</div>
                                        <div className="text-sm text-neutral-400">{entry.time}</div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-neutral-400 text-center"
                                >
                                    No activity recorded
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
