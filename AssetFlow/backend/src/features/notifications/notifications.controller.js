// ============================================================
// notifications.controller.js
// Thin controller delegating all logic to notifications.service.js.
// ============================================================

const notificationsService = require('./notifications.service');
const { successResponse } = require('../../utils/response');

const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, unread } = req.query;
    const result = await notificationsService.getNotifications(req.user.id, { page, limit, unread });
    successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await notificationsService.markAsRead(id, req.user.id);
    successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};