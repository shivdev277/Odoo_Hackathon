/**
 * Audit Routes
 *
 * POST   /api/v1/audit-cycles                          — create cycle
 * POST   /api/v1/audit-cycles/:id/auditors             — add auditors + items
 * GET    /api/v1/audit-cycles/:id/items                — list items
 * PATCH  /api/v1/audit-items/:id                       — mark item
 * POST   /api/v1/audit-cycles/:id/close                — close cycle
 * GET    /api/v1/audit-cycles/:id/discrepancy-report   — get report
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./audit.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const { createCycleSchema, addAuditorsSchema, updateItemSchema, cycleIdSchema } = require('./audit.validators');
const { ROLES } = require('../../shared/roles');

router.use(authenticate);

// Create cycle — Asset Manager only
router.post('/cycles',
  authorize(ROLES.ASSET_MANAGER),
  validateRequest(createCycleSchema),
  ctrl.createCycle
);

// Add auditors + items — Asset Manager only
router.post('/cycles/:id/auditors',
  authorize(ROLES.ASSET_MANAGER),
  validateRequest(addAuditorsSchema),
  ctrl.addAuditors
);

// List items — authenticated users
router.get('/cycles/:id/items',
  validateRequest(cycleIdSchema),
  ctrl.getItems
);

// Close cycle — Asset Manager only
router.post('/cycles/:id/close',
  authorize(ROLES.ASSET_MANAGER),
  validateRequest(cycleIdSchema),
  ctrl.closeCycle
);

// Discrepancy report — authenticated users
router.get('/cycles/:id/discrepancy-report',
  validateRequest(cycleIdSchema),
  ctrl.getDiscrepancyReport
);

// Active cycle for UI screen
router.get('/active', ctrl.getActiveCycle);

// Mark audit item — any assigned auditor (checked in service)
router.patch('/items/:id',
  validateRequest(updateItemSchema),
  ctrl.updateItem
);

// Verify item by assetId within audit cycle
router.patch('/:auditId/items/:assetId', ctrl.updateItemByAssetId);

// Direct close cycle
router.post('/:id/close', authorize(ROLES.ASSET_MANAGER), ctrl.closeCycle);

module.exports = router;
