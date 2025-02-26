import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, Link } from "react-router-dom"; //useLocation
import { FaDownload, FaEdit, FaSave, FaTimes, FaPlus, FaTrashAlt } from "react-icons/fa";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import axios from 'axios';
import Modal from "../../Modal";
// import { format } from "date-fns";
import { AuthContext } from "../../../AuthContext";
import { parseDate } from "../../../utils/dateUtils"; 
import { toast } from 'sonner';

pdfMake.vfs = pdfFonts.vfs;

const Invoice = ({invoiceData}) => {
  const { id } = useParams(); // Extract invoice ID from URL params
  const [invoice, setInvoice] = useState(null); // Invoice state
  const invoiceRef = useRef(); // Reference for PDF generation
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});
  const { auth } = useContext(AuthContext);
  const [newRow, setNewRow] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const generatePDF = () => {
    const invoiceElement = invoiceRef.current;
  
    if (!invoiceElement) {
      console.error("Invoice reference not found");
      return;
    }
  
    if (!invoice) {
      console.error("Invoice data is not loaded");
      return;
    }

    const invoiceSubtotal = Number(subtotal) || 0;
    const invoiceTaxAmount = Number(taxAmount) || 0;
    const invoiceTotal = Number(total) || 0;
  
    const docDefinition = {
      content: [
        { text: 'INVOICE', style: 'header' },
        {
          columns: [
            [
              { text: 'Return Address:', bold: true },
              { text: invoice.user?.name || 'Sender Name', bold: true },
              { text: invoice.user?.address || 'Sender Address' },
              { text: `Phone: ${invoice.user?.phone || 'Sender Phone'}` },
              { text: `Email: ${invoice.user?.email || 'Sender Email'}` }
            ],
            [
              { text: 'Bill to:', bold: true },
              { text: 'Orange Frog Productions', bold: true },
              { text: '#280 2880 45 Ave SE' },
              { text: 'Calgary, AB T2B 3M1' },
              { text: 'Phone: 403-703-9218' },
              { text: 'Email: CrewInvoice@OrangeFrogProductions.com' }
            ]
          ]
        },
        {
          margin: [0, 20, 0, 0],
          columns: [
            { text: `Invoice #: ${invoice.invoiceNumber || 'N/A'}`, alignment: 'left' },
            { text: `Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, alignment: 'right' }
          ]
        },
  
        // Table for Invoice Items
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Date of Work', bold: true },
                { text: 'Actual Hours Worked', bold: true },
                { text: 'Notes', bold: true },
                { text: 'Billable Hours', bold: true },
                { text: 'Rate', bold: true },
                { text: 'Total', bold: true }
              ],
              ...invoice.dateOfWork.map((date, index) => [
                new Date(date).toLocaleDateString(),
                invoice.actualHoursWorked?.[index] ?? 'N/A',
                invoice.notes?.[index] ?? 'N/A',
                invoice.billableHours?.[index] ?? 'N/A',
                invoice.rate?.[index] !== undefined ? `$${invoice.rate[index].toFixed(2)}` : 'N/A',
                invoice.totals?.[index] !== undefined ? `$${invoice.totals[index].toFixed(2)}` : 'N/A'
              ])
            ]
          },
          layout: 'lightHorizontalLines'
        },
  
        {
          margin: [0, 20, 0, 0],
          text: [
              { text: `Subtotal: `, bold: true },
              { text: `$${invoiceSubtotal.toFixed(2)}` } 
          ]
      },
      {
          text: [
              { text: `Tax %: `, bold: true },
              { text: `${invoice.taxPercentage ?? '0'}%` }
          ]
      },
      {
          text: [
              { text: `Sales Tax: `, bold: true },
              { text: `$${invoiceTaxAmount.toFixed(2)}` } 
          ]
      },
      {
          text: [
              { text: `TOTAL: `, bold: true, fontSize: 14 },
              { text: `$${invoiceTotal.toFixed(2)}`, fontSize: 14 } 
          ],
          margin: [0, 5, 0, 0]
      }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        }
      }
    };
  
    pdfMake.createPdf(docDefinition).download(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

//   const formattedDate = (date) => {
//     // console.log("Checking date:", date); // Debugging

//     if (!date) {
//         console.error("Invalid date found:", date);
//         return "Invalid Date";
//     }

//     // If date is an array, extract the first element
//     const parsedDate = Array.isArray(date) ? date[0] : date;
    
//     try {
//         const formatted = format(new Date(parsedDate), "MM/dd/yyyy h:mm a");
//         return formatted;
//     } catch (error) {
//         console.error("Date parsing error:", error, "with value:", parsedDate);
//         return "Invalid Date";
//     }
// };

const handleDelete = (index) => {
  setItemToDelete(index);
  setShowDeletePopup(true);
};

const confirmDelete = async () => {
  if (itemToDelete === null || !invoice) return;

  // console.log("Attempting to delete item at index:", itemToDelete);
  // console.log("Invoice ID:", id);
  // console.log("Total items in invoice:", invoice.items.length);

  // Prevent sending an invalid index
  if (itemToDelete >= invoice.items.length || itemToDelete < 0) {
      console.error("Invalid item index:", itemToDelete);
      toast.error("Invalid row selection. Please refresh and try again.");
      return;
  }

  try {
      const response = await axios.delete(
          `${process.env.REACT_APP_BACKEND}/invoices/${id}/item/${itemToDelete}`
      );

      if (response.status === 200) {
          const updatedItems = invoice.items.filter((_, i) => i !== itemToDelete);
          setInvoice(prev => ({ ...prev, items: updatedItems }));

          setShowDeletePopup(false);
          toast.success("Row deleted successfully!");

          // Refresh page after saving
          setTimeout(() => {
            window.location.reload();
          }, 500);
      } else {
          toast.error("Failed to delete row. Please try again.");
      }
  } catch (error) {
      console.error("Error deleting row:", error);
      toast.error("Failed to delete row. Please try again.");
  }
};

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

        // Manually construct items array if it does not exist
        if (!data.items) {
          data.items = data.dateOfWork.map((date, index) => ({
            date: date || "N/A",
            actualHours: data.actualHoursWorked[index] || "N/A",
            notes: data.notes[index] || "N/A",
            billableHours: data.billableHours[index] || "N/A",
            rate: data.rate[index] || 0,
            total: data.totals[index] || 0
          }));
        }

        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
      }

      
    };

    fetchInvoice();
  }, [id]);

  const handleEdit = (index) => {
    setEditingRow(index);
    setEditedData({
      ...invoice.items[index],
      date: parseDate(invoice.items[index].date), // Convert to MM/DD/YYYY format when entering edit mode
    });
  };

  const handleSave = async (index) => {
    try {
        // Validate Date Format
        if (!editedData.date || !/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(editedData.date)) {
            toast.error("Invalid Date Format. Use MM/DD/YYYY (e.g., 12/15/2024).");
            return;
        }

        // Ensure Billable Hours & Rate are valid numbers
        if (isNaN(editedData.billableHours) || Number(editedData.billableHours) <= 0) {
            toast.error("Billable Hours must be a positive number.");
            return;
        }

        if (isNaN(editedData.rate) || Number(editedData.rate) <= 0) {
            toast.error("Rate must be a positive number.");
            return;
        }

        const updatedItems = [...invoice.items];

        updatedItems[index] = {
            ...editedData,
            date: parseDate(editedData.date, "MM/DD/YYYY", true), // Convert only if necessary
            actualHours: editedData.actualHours ?? "",
            notes: editedData.notes ?? "",
            billableHours: Number(editedData.billableHours),
            rate: Number(editedData.rate),
            total: (Number(editedData.billableHours) * Number(editedData.rate)).toFixed(2),
        };

        console.log("Sending update request:", { items: updatedItems });

        const response = await axios.put(
            `${process.env.REACT_APP_BACKEND}/invoices/${id}`,
            { items: updatedItems }
        );

        console.log("Update response:", response.data);

        if (response.status === 200) {
            setInvoice((prev) => ({ ...prev, items: updatedItems }));
            setEditingRow(null);
            toast.success("Row updated successfully!");

            // Refresh page after saving
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            console.error("Update failed:", response.status, response.data);
            toast.error("Failed to update row. Please try again.");
        }
    } catch (error) {
        console.error("Error updating invoice:", error);
        toast.error("Error updating invoice. Please check your input and try again.");
    }
};

  const handleChange = (e, field) => {
    setEditedData({ ...editedData, [field]: e.target.value });
  };

  const addNewRow = () => {
    setNewRow({ date: "", actualHours: "", notes: "", billableHours: "", rate: "", total: "" });
    setErrorMessage("");
  };

  const handleNewRowChange = (e, field) => {
    setNewRow({ ...newRow, [field]: e.target.value });
  };

  const handleSaveNewRow = async () => {
    if (!newRow.date || !newRow.billableHours || !newRow.rate) {
        toast.error("Please fill in all required fields: Date, Billable Hours, and Rate.");
        return;
    }

    // Validate Date Format (MM/DD/YYYY)
    const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!datePattern.test(newRow.date)) {
        toast.error("Invalid Date Format. Use MM/DD/YYYY (e.g., 12/15/2024).");
        return;
    }

    // Ensure Billable Hours & Rate are valid numbers
    if (isNaN(newRow.billableHours) || Number(newRow.billableHours) <= 0) {
        toast.error("Billable Hours must be a positive number.");
        return;
    }

    if (isNaN(newRow.rate) || Number(newRow.rate) <= 0) {
        toast.error("Rate must be a positive number.");
        return;
    }

    // Format the new row data properly before saving
    const formattedNewRow = {
        ...newRow,
        date: parseDate(newRow.date.trim(), "MM/DD/YYYY", true), // Convert to ISO format
        actualHours: newRow.actualHours ? newRow.actualHours.trim() : "",
        notes: newRow.notes ? newRow.notes.trim() : "",
        billableHours: Number(newRow.billableHours),
        rate: Number(newRow.rate),
        total: (Number(newRow.billableHours) * Number(newRow.rate)).toFixed(2),
    };

    console.log("Saving new row:", formattedNewRow);

    const updatedItems = [...invoice.items, formattedNewRow];

    try {
        const response = await axios.put(`${process.env.REACT_APP_BACKEND}/invoices/${id}`, { items: updatedItems });

        if (response.status === 200) {
            console.log("New row added successfully:", response.data);
            setInvoice((prev) => ({ ...prev, items: updatedItems }));
            setNewRow(null);
            setErrorMessage("");
            toast.success("New row added successfully!");
            
            // Refresh page after saving
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    } catch (error) {
        console.error("Error updating invoice:", error);
        toast.error("Failed to update invoice. Please try again.");
    }
  };

  const calculateTotals = () => {
    if (!invoice || !invoice.items) return;

    const newSubtotal = invoice.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const newTaxAmount = (newSubtotal * (invoice.taxPercentage / 100)).toFixed(2);
    const newTotal = (newSubtotal + Number(newTaxAmount)).toFixed(2);

    setSubtotal(newSubtotal);
    setTaxAmount(newTaxAmount);
    setTotal(newTotal);
  };

  useEffect(() => {
    calculateTotals();
  }, [invoice]);

  return (
    <div className="p-8 bg-gray-100 dark:bg-neutral-900 min-h-screen">
      <Link
        to={auth.role === "admin" ? "/admin/invoices" : "/user/invoices"}
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
          onClick={generatePDF}
          className="absolute top-0 right-0 px-6 py-2 w-auto bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors flex items-center"
        >
          <FaDownload className="mr-2" />
          Download PDF
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">Invoice Details</h1>

        {invoice ? (
          <div 
            ref={invoiceRef}
            className="max-w-4xl mx-auto p-6 rounded-lg shadow bg-neutral-800 text-white"
            style={{
              width: "100%",
              minHeight: "100vh",
              padding: "20px"
          }}
          >
            {/* User and Bill To Section */}
            <div className="flex justify-between mb-6 text-white">
              <div>
                <p className="font-bold">Return address:</p>
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
                  <th className="p-2 border border-gray-700 text-white w-56">Date of Work</th>
                  <th className="p-2 border border-gray-700 text-white w-40">Actual Hours Worked</th>
                  <th className="p-2 border border-gray-700 text-white w-64">Notes</th>
                  <th className="p-2 border border-gray-700 text-white w-24">Billable Hours</th>
                  <th className="p-2 border border-gray-700 text-white w-32">Rate</th>
                  <th className="p-2 border border-gray-700 text-white w-32">Total</th>
                  <th className="p-2 border border-gray-700 text-white w-28 text-center">Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {invoice?.items?.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <tr key={index}>
                      {editingRow === index ? (
                        <>
                          {/* Editable Date Input (Shows MM/DD/YYYY Format) */}
                          <td>
                            <input
                              className="bg-transparent border border-gray-500 p-1 text-white w-full"
                              value={editedData.date ?? ""} // Ensures the date is not empty
                              onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
                              placeholder="MM/DD/YYYY"
                            />
                          </td>
                          <td><input className="bg-transparent border border-gray-500 p-1 text-white w-full" value={editedData.actualHours || ''} onChange={(e) => handleChange(e, 'actualHours')} placeholder="HH:MM - HH:MM" /></td>
                          <td><input className="bg-transparent border border-gray-500 p-1 text-white w-full" value={editedData.notes || ''} onChange={(e) => handleChange(e, 'notes')} /></td>
                          <td><input className="bg-transparent border border-gray-500 p-1 text-white w-full" value={editedData.billableHours || ''} onChange={(e) => handleChange(e, 'billableHours')} /></td>
                          <td>$ <input className="bg-transparent border border-gray-500 p-1 text-white w-3/4" value={editedData.rate || ''} onChange={(e) => handleChange(e, 'rate')} /></td>
                          <td className="text-center w-32">${(editedData.billableHours * editedData.rate).toFixed(2)}</td>
                          <td className="w-28 border border-gray-700 text-center flex justify-center gap-2">
                            <button onClick={() => handleSave(index)} className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-white w-auto mt-0">
                              <FaSave />
                            </button>
                            <button onClick={() => setEditingRow(null)} className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-white w-auto mt-0">
                              <FaTimes />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Read-Only Display */}
                          <td className="w-56">{parseDate(invoice.dateOfWork[index] || "")}</td>
                          <td className="w-40">{item.actualHours}</td>
                          <td className="w-64">{item.notes}</td>
                          <td className="w-24">{item.billableHours}</td>
                          <td className="w-32">${Number(item.rate).toFixed(2)}</td>
                          <td className="text-center w-32 whitespace-nowrap">${Number(item.total).toFixed(2)}</td>
                          <td className="w-28 border-none text-center flex justify-center gap-2">
                            {/* Edit Button */}
                            <button 
                              onClick={() => handleEdit(index)} 
                              className="bg-gray-600 hover:bg-gray-500 p-2 py-1 rounded text-white w-auto mt-0"
                            >
                              <FaEdit />
                            </button>

                            {/* Delete Button */}
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(index);
                              }} 
                              className="bg-gray-600 hover:bg-gray-500 p-2 py-1 rounded text-white w-auto mt-0"
                            >
                              <FaTrashAlt className="text-red-500" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-400">No invoice items available</td>
                  </tr>
                )}

                {/* New Row Input Fields (Only Shown When 'Add Row' is Clicked) */}
                {newRow && (
                  <tr className="">
                    <td><input className="bg-transparent border border-gray-500 p-1 text-white w-full" value={newRow.date} onChange={(e) => handleNewRowChange(e, 'date')} placeholder="MM/DD/YYYY" /></td>
                    <td><input className="bg-transparent border border-gray-500 p-1 text-white w-full" value={newRow.actualHours} onChange={(e) => handleNewRowChange(e, 'actualHours')} placeholder="HH:MM - HH:MM" /></td>
                    <td><input className="bg-transparent border border-gray-500 p-1 text-white w-full" value={newRow.notes} onChange={(e) => handleNewRowChange(e, 'notes')} /></td>
                    <td><input className="bg-transparent border border-gray-500 p-1 text-white w-full" value={newRow.billableHours} onChange={(e) => handleNewRowChange(e, 'billableHours')} /></td>
                    <td>$ <input className="bg-transparent border border-gray-500 p-1 text-white w-3/4" value={newRow.rate} onChange={(e) => handleNewRowChange(e, 'rate')} /></td>
                    <td className="text-center w-32">${(newRow.billableHours * newRow.rate).toFixed(2)}</td>
                    <td className="text-center flex justify-center gap-2">
                      <button onClick={handleSaveNewRow} className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-white w-auto mt-0">
                        <FaSave />
                      </button>
                      <button onClick={() => setNewRow(null)} className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-white w-auto mt-0">
                        <FaTimes />
                      </button>
                    </td>
                  </tr>
                )}
                {errorMessage && <tr><td colSpan="7" className="text-red-500 text-center">{errorMessage}</td></tr>}
              </tbody>
            </table>

            <div className="flex justify-end mb-4">
                <button onClick={addNewRow} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded flex items-center w-auto mt-2">
                    <FaPlus className="mr-2 " /> Add Row
                </button>
            </div>

            {/* Invoice Totals */}
            <div className="mt-6 text-white">
              <p className="mb-2">
                <strong>Subtotal:</strong> ${subtotal.toFixed(2)}
              </p>
              <p className="mb-2">
                <strong>Tax Percentage:</strong> {invoice.taxPercentage}%
              </p>
              <p className="mb-2">
                <strong>Tax Amount:</strong> ${taxAmount}
              </p>
              <p className="text-xl font-bold">
                <strong>Total:</strong> ${total}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-white text-center">Loading invoice details...</p>
        )}
      </div>
      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <Modal>
            <div className="bg-neutral-900 p-8 rounded-md shadow-lg w-full max-w-md border border-neutral-700">
                <h2 className="text-red-500 text-2xl mb-4">
                    Are you sure you want to delete this row?
                </h2>
                <p className="text-neutral-300 mb-6">
                    This action cannot be undone. Once deleted, this row's data will be permanently removed.
                </p>
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={() => setShowDeletePopup(false)} 
                        className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete} 
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-full transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
      )}
    </div>

    
    
  );
};

export default Invoice;
