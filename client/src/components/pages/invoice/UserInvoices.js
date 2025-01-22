import React, { useEffect, useState, useContext } from "react";
import { FaTh, FaList, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../../AuthContext";

const UserInvoices = () => {
  const { auth } = useContext(AuthContext); // Access user authentication context
  const [invoices, setInvoices] = useState([]); // State for storing invoices
  const [isGridView, setIsGridView] = useState(true); // View toggle (grid or table)
  const [sortField, setSortField] = useState(null); // Field to sort by
  const [sortDirection, setSortDirection] = useState("asc"); // Sorting direction
  const navigate = useNavigate(); // Navigation hook for redirects

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        if (!auth.userId) {
          console.error("User ID is missing in auth context");
          return;
        }
        console.log("User ID:", auth.userId);

        const response = await fetch(`${process.env.REACT_APP_BACKEND}/invoices/user/${auth.userId}`);
        if (!response.ok) {
          console.error(`Failed to fetch invoices: ${response.statusText}`);
          return;
        }

        const data = await response.json();
        setInvoices(data); // Set invoices in state
      } catch (error) {
        console.error("Error fetching user invoices:", error);
      }
    };

    fetchInvoices();
  }, [auth.userId]); // Fetch invoices whenever `auth.userId` changes

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
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
        to="/user/dashboard"
        className="mb-8 flex items-center text-gray-300 hover:text-white transition-colors"
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

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Invoices</h1>

        <div className="flex justify-end mb-4 space-x-2">
            <button
            onClick={() => setIsGridView(false)}
            className={`p-2 ${
                !isGridView ? "bg-gray-700 text-white" : "bg-gray-300 text-black"
            } rounded-l-full w-auto`}
            >
            <FaList />
            </button>
            <button
            onClick={() => setIsGridView(true)}
            className={`p-2 ${
                isGridView ? "bg-gray-700 text-white" : "bg-gray-300 text-black"
            } rounded-r-full w-auto`}
            >
            <FaTh />
            </button>
        </div>
        </div>

      {/* Grid View */}
      {isGridView && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedInvoices.map((invoice) => (
            <div
              key={invoice._id}
              className="p-4 bg-neutral-800 text-white rounded shadow cursor-pointer"
              onClick={() => navigate(`/user/invoices/${invoice._id}`)}
            >
              <h3 className="text-lg font-bold">{invoice.show}</h3>
              <p className="text-sm text-gray-400">Venue: {invoice.venue}</p>
              <p className="text-sm text-gray-400">Invoice #: {invoice._id}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {!isGridView && (
        <div className="overflow-auto">
          <table className="w-full border-collapse border border-gray-700">
          <thead className="w-full bg-gray-700  text-white">
            <tr className="flex w-full items-center">
                <th className="flex-1 p-2 border border-gray-700 flex items-center justify-between">
                <p className="flex-1 text-center">Show</p>
                <span
                    onClick={() => handleSort("show")}
                    className="cursor-pointer"
                >
                    {sortField === "show" && sortDirection === "asc" ? (
                    <FaSortAlphaUp />
                    ) : (
                    <FaSortAlphaDown />
                    )}
                </span>
                </th>
                <th className="flex-1 p-2 border border-gray-700 flex items-center justify-between">
                <p className="flex-1 text-center">Venue</p>
                <span
                    onClick={() => handleSort("venue")}
                    className="cursor-pointer"
                >
                    {sortField === "venue" && sortDirection === "asc" ? (
                    <FaSortAlphaUp />
                    ) : (
                    <FaSortAlphaDown />
                    )}
                </span>
                </th>
                <th className="flex-1 p-2 border border-gray-700 text-center">
                Invoice #
                </th>
            </tr>
            </thead>

            <tbody>
              {sortedInvoices.map((invoice) => (
                <tr
                  key={invoice._id}
                  className="hover:bg-gray-800 text-gray-400 cursor-pointer"
                  onClick={() => navigate(`/user/invoices/${invoice._id}`)}
                >
                  <td className="p-2 border border-gray-700">{invoice.show}</td>
                  <td className="p-2 border border-gray-700">{invoice.venue}</td>
                  <td className="p-2 border border-gray-700">{invoice._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserInvoices;
