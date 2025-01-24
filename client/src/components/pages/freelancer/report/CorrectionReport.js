import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { HoverBorderGradient } from '../../../ui/hover-border-gradient';

const CorrectionReport = () => {
  const [formData, setFormData] = useState({
    reportTitle: '',
    eventDate: '',
    startDate: '',
    endDate: '',
    requestType: '',
    description: '',
    requestedCorrection: '',
  });
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [files, setFiles] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND}/events`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.reportTitle || !formData.eventDate || !formData.startDate || !formData.endDate || 
        !formData.requestType || !formData.description || !formData.requestedCorrection) {
        toast.error("Please fill in all required fields.");
        setLoading(false);
        return;
    }

    // Ensure correct data formatting
    const formattedData = {
      ...formData,
      eventDate: new Date(formData.eventDate).toISOString(),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };

    const formDataToSend = new FormData();
    Object.keys(formattedData).forEach(key => {
        formDataToSend.append(key, formattedData[key]);
    });

    // Handle file uploads
    if (files && files.length > 0) {
        Array.from(files).forEach(file => {
            formDataToSend.append('files', file);
        });
    }

    // Debugging: Log the form data
    for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND}/correction-report`,
        formattedData,
        { headers: { 'Content-Type': 'application/json' } }
      );
        toast.success('Correction report submitted successfully');
        setFormData({
          reportTitle: '',
          eventDate: '',
          startDate: '',
          endDate: '',
          requestType: '',
          description: '',
          requestedCorrection: '',
        });
        setFiles(null);
    } catch (error) {
        console.error("Error submitting correction report:", error);
        toast.error('Failed to submit correction report');
    } finally {
        setLoading(false);
    }
 };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-8 bg-neutral-900">
      <Link 
        to="/dashboard"
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
        Return to Dashboard
      </Link>

      <div className="w-full max-w-4xl bg-neutral-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Submit Correction Report</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-white mb-2">Event</label>
            <select
              name="reportTitle"
              value={formData.reportTitle}
              onChange={handleChange}
              className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
              required
            >
              <option value="">Select an Event</option>
              {events.map((event, index) => (
                <option key={index} value={event.eventName}>
                  {event.eventName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2">Event Date</label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
          </div>

          <div>
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

          <div className="col-span-2">
            <label className="block text-white mb-2">Requested Correction</label>
            <textarea
              name="requestedCorrection"
              value={formData.requestedCorrection}
              onChange={handleChange}
              className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500 transition-colors h-32"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-white mb-2">Upload Files</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

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