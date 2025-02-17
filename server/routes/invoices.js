const express = require('express');
const { invoiceCollection, userCollection } = require('../mongo');
const router = express.Router();
const { parseDate } = require("../utils/dateUtils"); 


// Admin route to fetch all invoices
router.get('/admin', async (req, res) => {
  try {
    const invoices = await invoiceCollection.find().populate('user', 'name email');
    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching admin invoices:", error);
    res.status(500).json({ message: 'Failed to fetch admin invoices' });
  }
});

// User route to fetch invoices specific to a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const invoices = await invoiceCollection.find({ user: userId });
    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching user invoices:", error);
    res.status(500).json({ message: 'Failed to fetch user invoices' });
  }
});

// Route to fetch a single invoice by ID with populated user data
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the invoice and populate user details
      const invoice = await invoiceCollection.findById(id).populate('user', 'name address phone email');
      
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
  
      res.status(200).json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: 'Failed to fetch invoice' });
    }
  });

  // Route to update an invoice by ID
  router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        console.log("Incoming PUT request for invoice ID:", id);
        console.log("Request body:", req.body);

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: "Invalid request format" });
        }

        // Ensure proper date formatting and remove hidden characters
        const formattedItems = items.map(item => ({
            ...item,
            date: item.date.includes("T") 
                ? item.date.replace(/\s/g, "") // Remove spaces/tabs from already formatted ISO dates
                : parseDate(item.date.trim(), "MM/DD/YYYY", true), // Convert MM/DD/YYYY → ISO

            actualHours: item.actualHours ? item.actualHours.trim() : "",
            notes: item.notes ? item.notes.trim() : "",
            billableHours: Number(item.billableHours),
            rate: Number(item.rate),
            total: Number(item.total)
        }));

        console.log("Formatted Items before updating:", formattedItems);

        const billableHours = formattedItems.map(item => item.billableHours);
        const rate = formattedItems.map(item => item.rate);
        const totals = formattedItems.map(item => item.total);
        const actualHours = formattedItems.map(item => item.actualHours);
        const notes = formattedItems.map(item => item.notes);
        const dateOfWork = formattedItems.map(item => new Date(item.date)); // Ensure valid Date objects

        // Perform the update in MongoDB
        const updatedInvoice = await invoiceCollection.findByIdAndUpdate(
            id,
            {
                $set: {
                    items: formattedItems,
                    billableHours,
                    rate,
                    totals,
                    actualHoursWorked: actualHours,
                    notes,
                    dateOfWork
                }
            },
            { new: true, runValidators: true } // Ensure it returns the updated invoice
        );

        if (!updatedInvoice) {
            console.error("Invoice not found:", id);
            return res.status(404).json({ message: 'Invoice not found' });
        }

        console.log("Updated invoice successfully:", updatedInvoice);
        res.status(200).json(updatedInvoice);
    } catch (error) {
        console.error("Error updating invoice:", error);
        res.status(500).json({ message: "Failed to update invoice" });
    }
});

// Route to delete a specific row from an invoice
router.delete('/:invoiceId/item/:itemIndex', async (req, res) => {
  try {
      const { invoiceId, itemIndex } = req.params;

      // console.log("Received DELETE request for invoice:", invoiceId);
      // console.log("Received itemIndex:", itemIndex);

      // Ensure itemIndex is a valid number
      const index = parseInt(itemIndex, 10);
      if (isNaN(index) || index < 0) {
          console.error("Invalid itemIndex:", itemIndex);
          return res.status(400).json({ message: "Invalid item index" });
      }

      // Fetch the invoice
      const invoice = await invoiceCollection.findById(invoiceId);
      if (!invoice) {
          console.error("Invoice not found for ID:", invoiceId);
          return res.status(404).json({ message: "Invoice not found" });
      }

      // console.log("Invoice found:", invoice);

      // Ensure that all required arrays exist
      if (!invoice.dateOfWork || !invoice.actualHoursWorked || !invoice.billableHours ||
          !invoice.rate || !invoice.totals || !invoice.notes) {
          console.error("One or more required arrays are missing from invoice:", invoice);
          return res.status(400).json({ message: "Invoice data arrays are missing" });
      }

      // console.log("Total items before deletion:", invoice.dateOfWork.length);

      // Ensure itemIndex is within bounds for all arrays
      if (index >= invoice.dateOfWork.length || index >= invoice.actualHoursWorked.length ||
          index >= invoice.billableHours.length || index >= invoice.rate.length ||
          index >= invoice.totals.length || index >= invoice.notes.length) {
          console.error("itemIndex out of range:", index);
          return res.status(400).json({ message: "Invalid item index, out of range" });
      }

      // Remove the item from each array
      invoice.dateOfWork.splice(index, 1);
      invoice.actualHoursWorked.splice(index, 1);
      invoice.billableHours.splice(index, 1);
      invoice.rate.splice(index, 1);
      invoice.totals.splice(index, 1);
      invoice.notes.splice(index, 1);

      console.log("Total items after deletion:", invoice.dateOfWork.length);

      // Recalculate totals
      invoice.subtotal = invoice.totals.reduce((sum, total) => sum + (Number(total) || 0), 0);
      invoice.taxAmount = ((invoice.subtotal * (invoice.taxPercentage || 0)) / 100).toFixed(2);
      invoice.total = (invoice.subtotal + Number(invoice.taxAmount)).toFixed(2);

      // Save updated invoice
      await invoice.save();

      console.log("Item deleted successfully, updated invoice:", invoice);
      res.status(200).json({ message: "Invoice item deleted successfully", invoice });
  } catch (error) {
      console.error("Error deleting invoice item:", error);
      res.status(500).json({ message: "Failed to delete invoice item" });
  }
});

module.exports = router;
