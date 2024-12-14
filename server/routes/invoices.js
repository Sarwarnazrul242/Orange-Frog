const express = require('express');
const { invoiceCollection } = require('../mongo');
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

// Route to fetch a single invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await invoiceCollection.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: 'Failed to fetch invoice' });
  }
});

module.exports = router;
