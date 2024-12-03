import React, { useState, useEffect, useContext } from "react";
import Calendar from 'react-calendar';
import { Link } from "react-router-dom";
import 'react-calendar/dist/Calendar.css';
import { AuthContext } from "../../../../AuthContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import './TimeCard.css';

const TimeCard = () => {
    const { auth } = useContext(AuthContext);

    const [approvedEvents, setApprovedEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);

    useEffect(() => {
        const fetchApprovedEvents = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND}/events/contractor/${auth.email}`);
                if (response.ok) {
                    const data = await response.json();
                    const approved = data.filter(event => event.status === 'approved');
                    setApprovedEvents(approved);
                } else {
                    toast.error("Failed to fetch events");
                }
            } catch (error) {
                console.error('Error fetching approved events:', error);
                toast.error("Error loading events");
            } finally {
                setIsLoading(false);
            }
        };

        fetchApprovedEvents();
    }, [auth.email]);

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const isEventDate = approvedEvents.some(event => 
                new Date(event.eventLoadIn).toDateString() === date.toDateString() ||
                new Date(event.eventLoadOut).toDateString() === date.toDateString()
            );

            if (isEventDate) return 'event-date';
        }
        return null;
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        
        const eventsForDate = approvedEvents.filter(event => {
            const loadInDate = new Date(event.eventLoadIn).toDateString();
            const loadOutDate = new Date(event.eventLoadOut).toDateString();
            return loadInDate === date.toDateString() || loadOutDate === date.toDateString();
        }).map(event => ({
            ...event,
            type: new Date(event.eventLoadIn).toDateString() === date.toDateString() ? 'Load In' : 'Load Out',
            hours: new Date(event.eventLoadIn).toDateString() === date.toDateString() 
                ? event.eventLoadInHours 
                : event.eventLoadOutHours,
            time: new Date(event.eventLoadIn).toDateString() === date.toDateString()
                ? new Date(event.eventLoadIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date(event.eventLoadOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        setSelectedDateEvents(eventsForDate);
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

            <div className="flex justify-between items-center mb-12">
                <div className="w-24"> {/* Spacer div */}</div>
                    <h1 className="text-3xl font-bold text-white text-center">Time Card</h1>
                <div className="flex space-x-2 items-center w-24"> {/* Fixed width to match left spacer */}
                </div>
            </div>

            {isLoading ? (
                <motion.div
                    className="w-16 h-16 border-4 border-neutral-600 border-t-blue-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            ) : (
                <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl">
                    <motion.div
                        className="calendar-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Calendar
                            tileClassName={tileClassName}
                            className="react-calendar"
                            onClickDay={handleDateClick}
                            value={selectedDate}
                        />
                    </motion.div>

                    <motion.div
                        className="event-details-container"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {selectedDate ? (
                            <>
                                <h2 className="text-xl font-semibold text-white mb-4">
                                    Events for {selectedDate.toLocaleDateString()}
                                </h2>
                                {selectedDateEvents.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedDateEvents.map((event, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="event-card"
                                            >
                                                <h3 className="text-lg text-white  font-bold mb-4">{event.eventName}</h3>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-neutral-400">Type:</span>
                                                        <span className="ml-2 text-white">{event.type}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-neutral-400">Start Time:</span>
                                                        <span className="ml-2 text-white">{event.time}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-neutral-400">Hours:</span>
                                                        <span className="ml-2 text-white">{event.hours}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-neutral-400">Location:</span>
                                                        <span className="ml-2 text-white">{event.eventLocation}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-neutral-400">No events scheduled for this date.</p>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-neutral-400">
                                <p>Select a date to view event details</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default TimeCard;