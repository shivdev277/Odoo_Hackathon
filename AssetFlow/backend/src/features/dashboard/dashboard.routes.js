const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth.middleware');
const dashboardController = require('./dashboard.controller');

router.use(authenticate);

router.get('/kpis', dashboardController.getKpis);
router.get('/overdue', dashboardController.getOverdue);

module.exports = router;