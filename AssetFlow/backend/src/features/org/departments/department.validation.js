// ============================================================
// department.validation.js
// Manual validation — never trust frontend input.
// ============================================================

const { ValidationError } = require('../../../utils/errors');

const MAX_NAME_LENGTH = 150;
const MAX_DESC_LENGTH = 500;

/**
 * Validates and sanitises the body for POST /departments.
 */
const validateCreateDepartment = (req, res, next) => {
  let { name, description, parent_department_id } = req.body;

  // name is required
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return next(new ValidationError('Department name is required'));
  }
  name = name.trim();
  if (name.length > MAX_NAME_LENGTH) {
    return next(new ValidationError(`Department name must be at most ${MAX_NAME_LENGTH} characters`));
  }

  // description is optional
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      return next(new ValidationError('Description must be a string'));
    }
    description = description.trim();
    if (description.length > MAX_DESC_LENGTH) {
      return next(new ValidationError(`Description must be at most ${MAX_DESC_LENGTH} characters`));
    }
  }

  // parent_department_id is optional but must be a positive integer when provided
  if (parent_department_id !== undefined && parent_department_id !== null && parent_department_id !== '') {
    const parsed = parseInt(parent_department_id, 10);
    if (isNaN(parsed) || parsed <= 0) {
      return next(new ValidationError('parent_department_id must be a positive integer'));
    }
    req.body.parent_department_id = parsed;
  } else {
    req.body.parent_department_id = null;
  }

  // Sanitise back onto req.body
  req.body.name = name;
  req.body.description = description || null;

  next();
};

/**
 * Validates and sanitises the body for PATCH /departments/:id.
 * At least one of name / description / parent_department_id must be present.
 */
const validateUpdateDepartment = (req, res, next) => {
  let { name, description, parent_department_id } = req.body;
  const hasName = name !== undefined && name !== null;
  const hasDesc = description !== undefined && description !== null;
  const hasParent = parent_department_id !== undefined;

  if (!hasName && !hasDesc && !hasParent) {
    return next(new ValidationError('At least one field (name, description, parent_department_id) must be provided'));
  }

  if (hasName) {
    if (typeof name !== 'string' || name.trim() === '') {
      return next(new ValidationError('Department name cannot be empty'));
    }
    name = name.trim();
    if (name.length > MAX_NAME_LENGTH) {
      return next(new ValidationError(`Department name must be at most ${MAX_NAME_LENGTH} characters`));
    }
    req.body.name = name;
  }

  if (hasDesc) {
    if (typeof description !== 'string') {
      return next(new ValidationError('Description must be a string'));
    }
    description = description.trim();
    if (description.length > MAX_DESC_LENGTH) {
      return next(new ValidationError(`Description must be at most ${MAX_DESC_LENGTH} characters`));
    }
    req.body.description = description;
  }

  if (hasParent) {
    if (parent_department_id === null || parent_department_id === '') {
      // Explicitly clearing parent
      req.body.parent_department_id = null;
    } else {
      const parsed = parseInt(parent_department_id, 10);
      if (isNaN(parsed) || parsed <= 0) {
        return next(new ValidationError('parent_department_id must be a positive integer'));
      }
      req.body.parent_department_id = parsed;
    }
  }

  next();
};

module.exports = {
  validateCreateDepartment,
  validateUpdateDepartment,
};
