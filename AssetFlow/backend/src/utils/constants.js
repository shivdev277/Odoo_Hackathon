// ============================================================
// constants.js
// Centralised enums — never use magic strings anywhere else.
// Role values MUST match what is stored in the DB (lowercase).
// ============================================================

const ROLES = Object.freeze({
  ADMIN:            'admin',
  ASSET_MANAGER:    'asset_manager',
  DEPARTMENT_HEAD:  'department_head',
  EMPLOYEE:         'employee',
});

const USER_STATUS = Object.freeze({
  ACTIVE:   'active',
  INACTIVE: 'inactive',
});

const ASSET_STATUS = Object.freeze({
  AVAILABLE:      'available',
  ALLOCATED:      'allocated',
  IN_MAINTENANCE: 'in_maintenance',
  RETIRED:        'retired',
  MISSING:        'missing',
});

const REQUEST_STATUS = Object.freeze({
  PENDING:   'pending',
  APPROVED:  'approved',
  REJECTED:  'rejected',
  COMPLETED: 'completed',
});

const AUDIT_STATUS = Object.freeze({
  PASSED:            'passed',
  FAILED:            'failed',
  NEEDS_MAINTENANCE: 'needs_maintenance',
  MISSING:           'missing',
});

const ALLOCATION_STATUS = Object.freeze({
  ACTIVE:   'active',
  RETURNED: 'returned',
});

const BOOKING_STATUS = Object.freeze({
  ACTIVE:    'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

const ACTIONS = Object.freeze({
  // Departments
  DEPARTMENT_CREATED:     'DEPARTMENT_CREATED',
  DEPARTMENT_UPDATED:     'DEPARTMENT_UPDATED',
  DEPARTMENT_DEACTIVATED: 'DEPARTMENT_DEACTIVATED',

  // Categories
  CATEGORY_CREATED:     'CATEGORY_CREATED',
  CATEGORY_UPDATED:     'CATEGORY_UPDATED',
  CATEGORY_DEACTIVATED: 'CATEGORY_DEACTIVATED',

  // Employees
  EMPLOYEE_UPDATED:      'EMPLOYEE_UPDATED',
  EMPLOYEE_ROLE_CHANGED: 'EMPLOYEE_ROLE_CHANGED',
  EMPLOYEE_DEACTIVATED:  'EMPLOYEE_DEACTIVATED',
});

const ENTITIES = Object.freeze({
  DEPARTMENT: 'department',
  CATEGORY:   'category',
  EMPLOYEE:   'employee',
});

const NOTIFICATION_TYPES = Object.freeze({
  DEPARTMENT_DEACTIVATED: 'DEPARTMENT_DEACTIVATED',
  CATEGORY_DEACTIVATED:   'CATEGORY_DEACTIVATED',
  ROLE_CHANGED:           'ROLE_CHANGED',
  EMPLOYEE_DEACTIVATED:   'EMPLOYEE_DEACTIVATED',
});

module.exports = {
  ROLES,
  USER_STATUS,
  ASSET_STATUS,
  REQUEST_STATUS,
  AUDIT_STATUS,
  ALLOCATION_STATUS,
  BOOKING_STATUS,
  ACTIONS,
  ENTITIES,
  NOTIFICATION_TYPES,
};
