// ============================================================
// notifications.routes.js
// Routes definition for the Notifications feature.
// ============================================================

const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/auth.middleware');
const notificationsController = require('./notifications.controller');
const {
  validateGetNotifications,
  validateMarkAsRead,
} = require('./notifications.validation');

// Authentication middleware applied globally to all notification routes
router.use(authenticate);

// GET /api/notifications (paginated & optionally filtered)
router.get('/', validateGetNotifications, notificationsController.getNotifications);

// PATCH /api/notifications/:id/read (mark as read)
router.patch('/:id/read', validateMarkAsRead, notificationsController.markAsRead);

module.exports = router;