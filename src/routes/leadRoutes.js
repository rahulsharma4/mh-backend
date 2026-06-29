const express = require('express');
const router = express.Router();
const { createLead, getLeads, updateLead, logPhoneView } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createLead)
  .get(protect, getLeads);

router.route('/:id')
  .patch(protect, updateLead);

router.post('/:id/log-view-phone', protect, logPhoneView);

module.exports = router;
