import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";

const Invoice = () => {
  const { id } = useParams(); // Extract invoice ID from URL params
  const location = useLocation(); // Extract navigation state (e.g., origin: "admin" or "user")
  const [invoice, setInvoice] = useState(null); // Invoice state

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) {
        console.error("Invoice ID is undefined");
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/invoices/${id}`);
        if (!response.ok) {
          console.error(`Error fetching invoice: ${response.statusText}`);
          return;
        }

        const data = await response.json();
        setInvoice(data); // Update the invoice state
      } catch (error) {
        console.error("Error fetching invoice:", error);
      }
    };

    fetchInvoice();
  }, [id]);

  const origin = location.state?.origin || "admin"; // Determine origin (default: admin)
  const returnPath = origin === "admin" ? "/admin/invoices" : "/user/invoices";

  return (
    <div className="p-8 bg-gray-100 dark:bg-neutral-900 min-h-screen">
      <Link
        to={returnPath}
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
        Return to Invoices
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Invoice Details</h1>

      {invoice ? (
        <div className="max-w-4xl mx-auto bg-neutral-800 p-6 rounded shadow">
          <h2 className="text-2xl font-bold text-white mb-4">{invoice.show}</h2>
          <p className="text-sm text-gray-400 mb-2">Venue: {invoice.venue}</p>
          <p className="text-sm text-gray-400 mb-6">Invoice #: {invoice.invoiceNumber}</p>

          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2 border border-gray-700 text-white">Date of Work</th>
                <th className="p-2 border border-gray-700 text-white">Actual Hours Worked</th>
                <th className="p-2 border border-gray-700 text-white">Notes</th>
                <th className="p-2 border border-gray-700 text-white">Billable Hours</th>
                <th className="p-2 border border-gray-700 text-white">Rate</th>
                <th className="p-2 border border-gray-700 text-white">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.dateOfWork.map((date, index) => (
                <tr key={index}>
                  <td className="p-2 border border-gray-700 text-gray-400">{new Date(date).toLocaleDateString()}</td>
                  <td className="p-2 border border-gray-700 text-gray-400">{invoice.actualHoursWorked[index]}</td>
                  <td className="p-2 border border-gray-700 text-gray-400">{invoice.notes[index]}</td>
                  <td className="p-2 border border-gray-700 text-gray-400">{invoice.billableHours[index]}</td>
                  <td className="p-2 border border-gray-700 text-gray-400">${invoice.rate[index].toFixed(2)}</td>
                  <td className="p-2 border border-gray-700 text-gray-400">${invoice.totals[index].toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 text-white">
            <p className="mb-2">
              <strong>Subtotal:</strong> ${invoice.subtotal.toFixed(2)}
            </p>
            <p className="mb-2">
              <strong>Tax Percentage:</strong> {invoice.taxPercentage}%
            </p>
            <p className="mb-2">
              <strong>Tax Amount:</strong> ${invoice.taxAmount.toFixed(2)}
            </p>
            <p className="text-xl font-bold">
              <strong>Total:</strong> ${invoice.total.toFixed(2)}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-white text-center">Loading invoice details...</p>
      )}
    </div>
  );
};

export default Invoice;
