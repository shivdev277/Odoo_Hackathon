const { successResponse } = require('../../utils/response');
const dashboardService = require('./dashboard.service');

const getKpis = async (req, res, next) => {
  try {
    const data = await dashboardService.getKpis();
    successResponse(res, data, 200);
  } catch (error) {
    next(error);
  }
};

const getOverdue = async (req, res, next) => {
  try {
    const data = await dashboardService.getOverdue();
    successResponse(res, data, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getKpis,
  getOverdue,
};