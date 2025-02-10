const express = require('express');
const { invoiceCollection, userCollection } = require('../mongo');
const router = express.Router();

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

        // Extract relevant fields to update
        const billableHours = items.map(item => Number(item.billableHours));
        const rate = items.map(item => Number(item.rate));
        const totals = items.map(item => Number(item.total));

        // Ensure numbers are correctly formatted before updating
        const formattedItems = items.map(item => ({
            ...item,
            billableHours: Number(item.billableHours),
            rate: Number(item.rate),
            total: Number(item.total)
        }));

        console.log("Formatted Items before updating:", formattedItems);

        const updatedInvoice = await invoiceCollection.findByIdAndUpdate(
            id,
            {
                $set: {
                    items: formattedItems,
                    billableHours,
                    rate,
                    totals
                }
            },
            { new: true }
        );

        if (!updatedInvoice) {
            console.error("Invoice not found:", id);
            return res.status(404).json({ message: 'Invoice not found' });
        }

        console.log("Updated invoice successfully:", updatedInvoice);
        res.status(200).json(updatedInvoice);
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ message: 'Failed to update invoice' });
    }
});
  

module.exports = router;
