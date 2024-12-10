// server/routes/correction-report.js
const express = require('express');
const router = express.Router();
const { correctionReportCollection } = require('../mongo');

router.post('/', async (req, res) => {
  try {
    const newReport = new correctionReportCollection({
      ...req.body,
      status: 'pending',
      submittedAt: new Date()
    });

    await newReport.save();
    res.status(201).json({ message: 'Correction report submitted successfully' });
  } catch (error) {
    console.error('Error submitting correction report:', error);
    res.status(500).json({ message: 'Error submitting correction report' });
  }
});

module.exports = router;