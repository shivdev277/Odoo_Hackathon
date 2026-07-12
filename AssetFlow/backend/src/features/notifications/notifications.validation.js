// ============================================================
// notifications.validation.js
// Manual validation for Notifications module endpoints.
// ============================================================

const { ValidationError } = require('../../utils/errors');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates query parameters for GET /notifications.
 */
const validateGetNotifications = (req, res, next) => {
  let { page = 1, limit = 10, unread } = req.query;

  // Validate page
  const parsedPage = Number(page);
  if (!Number.isInteger(parsedPage) || parsedPage <= 0) {
    return next(new ValidationError('Page must be a positive integer'));
  }

  // Validate limit
  const parsedLimit = Number(limit);
  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    return next(new ValidationError('Limit must be a positive integer'));
  }

  // Sanitise and attach back to query
  req.query.page = parsedPage;
  req.query.limit = Math.min(parsedLimit, 100); // Cap limit at 100
  req.query.unread = String(unread).toLowerCase() === 'true';

  next();
};

/**
 * Validates path parameters for PATCH /notifications/:id/read.
 */
const validateMarkAsRead = (req, res, next) => {
  const { id } = req.params;

  if (!id || !UUID_REGEX.test(id)) {
    return next(new ValidationError('Invalid notification ID format. Must be a UUID.'));
  }

  next();
};

module.exports = {
  validateGetNotifications,
  validateMarkAsRead,
};
