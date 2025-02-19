import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HoverBorderGradient } from '../../../ui/hover-border-gradient';
import { AuthContext } from "../../../../AuthContext";

const CorrectionReport = () => {
  const { auth } = useContext(AuthContext); // Get user authentication context
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const eventIDFromURL = queryParams.get('eventID');
  const [formData, setFormData] = useState({
    correctionName: "",
    eventID: eventIDFromURL || '',
    userID: '',
    requestType: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [files, setFiles] = useState(null);

  useEffect(() => {
    // Fetch events
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND}/events`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    // Fetch user by email from AuthContext
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND}/user-profile/${auth.email}`);
        setFormData((prevData) => ({
          ...prevData,
          userID: response.data._id, // Set user's ID in formData
        }));
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to fetch user details.');
      }
    };

    fetchUser();
    fetchEvents();
  }, [auth?.email]);

  useEffect(() => {
    if (eventIDFromURL) {
      setFormData((prevData) => ({
        ...prevData,
        eventID: eventIDFromURL,
      }));
    }
  }, [eventIDFromURL]);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.correctionName || !formData.eventID || !formData.requestType || !formData.description) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const formattedData = {
      ...formData,
    };

    // Create FormData object
    const formDataToSend = new FormData();
    Object.keys(formattedData).forEach(key => {
      formDataToSend.append(key, formattedData[key]);
    });

    if (files) {
      Array.from(files).forEach((file) => formDataToSend.append('files', file));
    }

    try {
      formDataToSend.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      await axios.post(
        `${process.env.REACT_APP_BACKEND}/correction-report`,
        formattedData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      toast.success('Correction report submitted successfully.');
      
      navigate('/user/manage-corrections');
    } catch (error) {
      console.error('Error submitting correction report:', error);
      toast.error('Failed to submit correction report.');
    } finally {
      setLoading(false);
    }
  };

  // Input change handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-8 bg-neutral-900">
      <Link
        to="/user/manage-corrections"
        className="mb-8 flex items-start text-neutral-400 hover:text-white transition-colors"
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
        Return to Manage Correction Reports
      </Link>

      <div className="w-full max-w-4xl bg-neutral-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Submit Correction Report</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Correction Name*/}
          <div className="col-span-2">
            <label className="block text-white mb-2">Correction Name</label>
            <input
              type="text"
              name="correctionName"
              value={formData.correctionName}
              onChange={handleChange}
              className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
          </div>

          {/* Event Selector */}
          <div className="col-span-2">
            <label className="block text-white mb-2">Event</label>
            <select
              name="eventID"
              value={formData.eventID}
              onChange={handleChange}
              className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
              required
            >
              <option value="">Select an Event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.eventName}
                </option>
              ))}
            </select>
          </div>

          {/* Request Type */}
          <div className="col-span-2">
            <label className="block text-white mb-2">Request Type</label>
            <input
              type="text"
              name="requestType"
              value={formData.requestType}
              onChange={handleChange}
              className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="block text-white mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500 transition-colors h-32"
              required
            />
          </div>

          {/* File Upload */}
          <div className="col-span-2">
            <label className="block text-white mb-2">Upload Files</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <div className="col-span-2 flex justify-center">
            <HoverBorderGradient className="rounded-full flex items-center space-x-2 h-12 px-6">
              <button
                type="submit"
                disabled={loading}
                className="text-white hover:text-orange-500 transition-colors disabled:text-neutral-500 bg-transparent mb-4"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </HoverBorderGradient>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CorrectionReport;
