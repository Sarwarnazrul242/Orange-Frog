import React, { useEffect, useState } from "react";
import { FaTh, FaList, FaSortDown, FaSortUp, FaSort } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [view, setView] = useState('list');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [nameFilter, setNameFilter] = useState("");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/invoices/admin`);
        if (!response.ok) {
          console.error(`Failed to fetch invoices: ${response.statusText}`);
          return;
        }
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    fetchInvoices();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.show.toLowerCase().includes(nameFilter.toLowerCase())
  );

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = String(a[sortField] || "").toLowerCase();
    const bValue = String(b[sortField] || "").toLowerCase();
    return sortDirection === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  return (
    <div className="p-8 bg-gray-100 dark:bg-neutral-900 min-h-screen">
      <Link
        to="/admin/dashboard"
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

      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-white text-center">Manage Invoices</h1>
        <div className="flex justify-between items-center w-full mt-5">
          <input
            type="text"
            placeholder="Search by Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-800 text-white rounded transition-colors outline-none  w-1/6"
          />
          <div className="flex items-center gap-3  ml-3">
            <AnimatePresence>
              {!showSortOptions && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}      
                  animate={{ opacity: 1, x: 0 }}         
                  exit={{ opacity: 0, x: -20 }}         
                  transition={{ duration: 0.3 }}
                  onClick={() => setShowSortOptions(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors mt-0 ${
                    showSortOptions
                      ? 'bg-neutral-700 text-white'
                      : 'bg-neutral-800 text-white hover:bg-neutral-700'
                  }`}
                >
                  <FaSort className="text-xl" />
                  <span className="whitespace-nowrap">Sort by</span>
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSortOptions && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}        // Start hidden & to the right
                  animate={{ opacity: 1, x: 0 }}          // Fade in from the right
                  exit={{ opacity: 0, x: 20 }}            // Fade out to the right when hidden
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-white whitespace-nowrap">Sort by:</span>

                  <button
                    className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0"
                    onClick={() => handleSort('show')}
                  >
                    Name
                  </button>

                  <button
                    className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0"
                    onClick={() => handleSort('createdAt')}
                  >
                    Date
                  </button>

                  <button
                    className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors mt-0"
                    onClick={() => handleSort('assignedContractors')}
                  >
                    Freelancer
                  </button>

                  <motion.button
                    initial={{ opacity: 0, x: -20 }}    // Fade in from the left
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}       // Fade out to the left when hiding
                    transition={{ delay: 0.2 }}
                    type="button"
                    onClick={() => setShowSortOptions(false)}
                    className="h-9 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors mt-0"
                  >
                    Cancel
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="hidden md:flex gap-2 ml-auto">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded transition-colors ${
                view === 'grid' 
                  ? 'bg-neutral-700 text-white' 
                  : 'bg-neutral-800 text-white hover:bg-neutral-700'
              }`}
            >
              <FaTh className="text-xl" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded transition-colors ${
                view === 'list' 
                  ? 'bg-neutral-700 text-white' 
                  : 'bg-neutral-800 text-white hover:bg-neutral-700'
              }`}
            >
              <FaList className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <div className="w-full flex justify-center">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="min-w-full bg-neutral-800/50 rounded-lg overflow-hidden mt-4">
              <thead className="bg-neutral-700">
                <tr>
                  <th
                    className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('show')}
                  >
                    <div className="flex items-center">
                      Show
                      <span className="ml-2">
                        {sortField === 'show' ? (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                      </span>
                    </div>
                  </th>
                  <th
                    className="p-4 text-left text-white cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('venue')}
                  >
                    <div className="flex items-center">
                      Venue
                      <span className="ml-2">
                        {sortField === 'venue' ? (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                      </span>
                    </div>
                  </th>
                  <th className="p-4 text-left text-white whitespace-nowrap">
                    Invoice #
                    
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedInvoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="border-t border-neutral-700 hover:bg-neutral-700/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/invoices/${invoice._id}`)}
                  >
                    <td className="p-4 text-white">{invoice.show}</td>
                    <td className="p-4 text-white">{invoice.venue}</td>
                    <td className="p-4 text-white">{invoice._id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedInvoices.map((invoice) => (
            <div
              key={invoice._id}
              className="p-4 bg-neutral-800 text-white rounded shadow cursor-pointer"
              onClick={() => navigate(`/admin/invoices/${invoice._id}`)}
            >
              <h3 className="text-lg font-bold">{invoice.show}</h3>
              <p className="text-sm text-gray-400">Venue: {invoice.venue}</p>
              <p className="text-sm text-gray-400">Invoice #: {invoice._id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInvoices;
