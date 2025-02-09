import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom"; //useLocation
import { FaDownload } from "react-icons/fa";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import axios from 'axios';

pdfMake.vfs = pdfFonts.pdfMake.vfs;


// pdfMake.vfs = pdfFonts.vfs;
// console.log(pdfFonts);


const Invoice = ({invoiceData}) => {
  const { id } = useParams(); // Extract invoice ID from URL params
  // const location = useLocation(); // Extract navigation state (e.g., origin: "admin" or "user")
  const [invoice, setInvoice] = useState(null); // Invoice state
  const invoiceRef = useRef(); // Reference for PDF generation
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});


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
          layout: 'lightHorizontalLines' // Adds light borders to the table
        },
  
        // Additional Details Outside the Table
        {
          margin: [0, 20, 0, 0],
          text: [
            { text: `Subtotal: `, bold: true },
            { text: `$${invoice.subtotal?.toFixed(2) ?? '0.00'}` }
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
            { text: `$${invoice.taxAmount?.toFixed(2) ?? '0.00'}` }
          ]
        },
        {
          text: [
            { text: `TOTAL: `, bold: true, fontSize: 14 },
            { text: `$${invoice.total?.toFixed(2) ?? '0.00'}`, fontSize: 14 }
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
        // console.log("Fetched invoice data:", data); // Debugging line
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
      }
    };

    fetchInvoice();
  }, [id]);

  const handleEdit = (index) => {
    setEditingRow(index);
    setEditedData(invoice.items[index]);
  };

  const handleSave = async (index) => {
    try {
      const updatedItems = [...invoice.items];
      updatedItems[index] = {
        ...editedData,
        total: (editedData.billableHours * editedData.rate).toFixed(2), // Ensure the total is recalculated
      };
  
      await axios.put(`${process.env.REACT_APP_BACKEND}/invoices/${id}`, { items: updatedItems });
  
      setInvoice((prev) => ({ ...prev, items: updatedItems }));
      setEditingRow(null);
      window.location.reload();
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const handleChange = (e, field) => {
    setEditedData({ ...editedData, [field]: e.target.value });
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
                  <th className="p-2 border border-gray-700 text-white">Date of Work</th>
                  <th className="p-2 border border-gray-700 text-white">Actual Hours Worked</th>
                  <th className="p-2 border border-gray-700 text-white">Notes</th>
                  <th className="p-2 border border-gray-700 text-white">Billable Hours</th>
                  <th className="p-2 border border-gray-700 text-white">Rate</th>
                  <th className="p-2 border border-gray-700 text-white">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice?.items?.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <tr key={index}>
                      {editingRow === index ? (
                        <>
                          <td><input value={editedData.date || ''} onChange={(e) => handleChange(e, 'date')} /></td>
                          <td><input value={editedData.actualHours || ''} onChange={(e) => handleChange(e, 'actualHours')} /></td>
                          <td><input value={editedData.notes || ''} onChange={(e) => handleChange(e, 'notes')} /></td>
                          <td><input value={editedData.billableHours || ''} onChange={(e) => handleChange(e, 'billableHours')} /></td>
                          <td><input value={editedData.rate || ''} onChange={(e) => handleChange(e, 'rate')} /></td>
                          <td>{(editedData.billableHours * editedData.rate).toFixed(2)}</td>
                          <td>
                            <button onClick={() => handleSave(index)} className="bg-green-500 p-1 rounded">Save</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{item.date}</td>
                          <td>{item.actualHours}</td>
                          <td>{item.notes}</td>
                          <td>{item.billableHours}</td>
                          <td>${item.rate.toFixed(2)}</td>
                          <td>${item.total.toFixed(2)}</td>
                          <td>
                            <button onClick={() => handleEdit(index)} className="bg-blue-500 p-1 rounded">Edit</button>
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
