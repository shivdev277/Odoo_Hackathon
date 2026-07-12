// ============================================================
// department.controller.js
// Thin controller — delegates all logic to department.service.js
// ============================================================

const departmentService = require('./department.service');
const { successResponse } = require('../../../utils/response');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await departmentService.getDepartments();
    successResponse(res, departments);
  } catch (err) {
    next(err);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(req.body, req.user.id);
    successResponse(res, department, 201);
  } catch (err) {
    next(err);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.updateDepartment(
      req.params.id,
      req.body,
      req.user.id
    );
    successResponse(res, department);
  } catch (err) {
    next(err);
  }
};

const deactivateDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.deactivateDepartment(
      req.params.id,
      req.user.id
    );
    successResponse(res, { message: 'Department deactivated successfully', department });
  } catch (err) {
    // Surface employee/asset counts in the error response if present
    if (err.meta) {
      err.message = `${err.message}. Active employees: ${err.meta.employee_count}, Active assets: ${err.meta.asset_count}`;
    }
    next(err);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
};
