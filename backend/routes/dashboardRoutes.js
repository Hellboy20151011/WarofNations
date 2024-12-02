const express = require('express');
const authenticate = require('../middleware/authenticate');
const { getDashboardData } = require('../controllers/dashboardController');
const router = express.Router();

router.get('/dashboard', authenticate, getDashboardData);

module.exports = router;
