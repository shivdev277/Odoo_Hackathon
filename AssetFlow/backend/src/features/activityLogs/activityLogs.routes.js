const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth.middleware');
const activityLogsController = require('./activityLogs.controller');

router.use(authenticate);

router.get('/', activityLogsController.getActivityLogs);

module.exports = router;