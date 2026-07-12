// ============================================================
// department.routes.js
// RBAC:
//   GET  → admin, asset_manager, department_head
//   POST, PATCH, DEACTIVATE → admin only
// ============================================================

const express = require('express');
const router = express.Router();

const authenticate = require('../../../middlewares/auth.middleware');
const authorize    = require('../../../middlewares/rbac.middleware');
const { ROLES }    = require('../../../utils/constants');

const departmentController = require('./department.controller');
const {
  validateCreateDepartment,
  validateUpdateDepartment,
} = require('./department.validation');

// All routes require a valid JWT
router.use(authenticate);

// GET /api/org/departments
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD),
  departmentController.getDepartments
);

// POST /api/org/departments
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validateCreateDepartment,
  departmentController.createDepartment
);

// PATCH /api/org/departments/:id
router.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  validateUpdateDepartment,
  departmentController.updateDepartment
);

// PATCH /api/org/departments/:id/deactivate
router.patch(
  '/:id/deactivate',
  authorize(ROLES.ADMIN),
  departmentController.deactivateDepartment
);

module.exports = router;
