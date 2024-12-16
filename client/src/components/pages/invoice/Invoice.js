import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { FaDownload } from "react-icons/fa";

const Invoice = () => {
  const { id } = useParams(); // Extract invoice ID from URL params
  const location = useLocation(); // Extract navigation state (e.g., origin: "admin" or "user")
  const [invoice, setInvoice] = useState(null); // Invoice state
  const invoiceRef = useRef(null); // Reference for PDF generation

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
        console.log("Fetched invoice data:", data); // Debugging line
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
      }
    };

    fetchInvoice();
  }, [id]);

  const handleDownload = () => {
    const element = invoiceRef.current;
    const options = {
      margin: 0.5,
      filename: `invoice_${id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="p-8 bg-gray-100 dark:bg-neutral-900 min-h-screen">
      <Link
        to="/user/invoices"
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

      <div className="relative">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="absolute top-0 right-0 px-6 py-2 w-auto bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors flex items-center"
        >
          <FaDownload className="mr-2" />
          Download PDF
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">Invoice Details</h1>

        {invoice ? (
          <div ref={invoiceRef} className="max-w-4xl mx-auto bg-neutral-800 p-6 rounded-lg shadow">
            {/* User and Bill To Section */}
            <div className="flex justify-between mb-6 text-white">
              <div>
                <p className="font-bold">{invoice.user.name}</p>
                <p>{invoice.user.address || "N/A"}</p>
                <p>Phone: {invoice.user.phone || "N/A"}</p>
                <p>Email: {invoice.user.email || "N/A"}</p>
              </div>
              <div>
                <p className="font-bold">Bill to:</p>
                <p>Orange Frog Productions</p>
                <p>#280 2880 45 Ave SE</p>
                <p>Calgary, AB T2B 3M1</p>
                <p>Phone: 403-703-9218</p>
                <p>Email: CrewInvoice@OrangeFrogProductions.com</p>
              </div>
            </div>

            {/* Invoice Details */}
            <h2 className="text-2xl font-bold text-white mb-4">Show: {invoice.show}</h2>
            <p className="text-sm text-gray-400 mb-2">Venue: {invoice.venue}</p>
            <p className="text-sm text-gray-400 mb-2">Invoice #: {invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-400 mb-2">LPO #: {invoice.lpoNumber || "N/A"}</p>
            <p className="text-sm text-gray-400 mb-6">
              Invoice Date: {new Date(invoice.createdAt).toLocaleDateString()}
            </p>

            {/* Invoice Table */}
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
                    <td className="p-2 border border-gray-700 text-gray-400">
                      {new Date(date).toLocaleDateString()}
                    </td>
                    <td className="p-2 border border-gray-700 text-gray-400">
                      {invoice.actualHoursWorked[index]}
                    </td>
                    <td className="p-2 border border-gray-700 text-gray-400">
                      {invoice.notes[index]}
                    </td>
                    <td className="p-2 border border-gray-700 text-gray-400">
                      {invoice.billableHours[index]}
                    </td>
                    <td className="p-2 border border-gray-700 text-gray-400">
                      ${invoice.rate[index].toFixed(2)}
                    </td>
                    <td className="p-2 border border-gray-700 text-gray-400">
                      ${invoice.totals[index].toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Invoice Totals */}
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
    </div>
  );
};

export default Invoice;
