// ============================================================
// department.service.js
// All business logic for departments lives here.
// Controllers must remain thin — no SQL, no business logic there.
// ============================================================

const { pool } = require('../../../config/db');
const {
  ConflictError,
  NotFoundError,
  ValidationError,
} = require('../../../utils/errors');
const { ACTIONS, ENTITIES, NOTIFICATION_TYPES } = require('../../../utils/constants');
const activityLogService = require('../../../services/activityLog.service');
const notificationService = require('../../../services/notification.service');

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Recursively walks the parent chain to detect circular references.
 * Returns true if candidateParentId is a descendant of departmentId.
 *
 * @param {object} client
 * @param {number} departmentId      - The department being updated
 * @param {number} candidateParentId - The proposed new parent
 */
const wouldCreateCycle = async (client, departmentId, candidateParentId) => {
  // Walk upward from candidateParentId; if we ever hit departmentId, it's a cycle
  let currentId = candidateParentId;
  const visited = new Set();

  while (currentId !== null) {
    if (currentId === departmentId) return true;
    if (visited.has(currentId)) break; // already seen — broken data, stop
    visited.add(currentId);

    const { rows } = await client.query(
      'SELECT parent_department_id FROM departments WHERE id = $1',
      [currentId]
    );
    if (rows.length === 0) break;
    currentId = rows[0].parent_department_id;
  }
  return false;
};

// ─────────────────────────────────────────────────────────────
// GET /departments
// Accessible by: ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD
// ─────────────────────────────────────────────────────────────
const getDepartments = async () => {
  const { rows } = await pool.query(`
    SELECT
      d.id,
      d.name,
      d.description,
      d.parent_department_id,
      pd.name AS parent_department_name,
      d.is_active,
      d.created_by,
      d.updated_by,
      d.created_at,
      d.updated_at,
      COUNT(DISTINCT u.id) FILTER (WHERE u.status = 'active') AS employee_count,
      COUNT(DISTINCT a.id) FILTER (WHERE a.status != 'retired') AS asset_count
    FROM departments d
    LEFT JOIN departments pd ON pd.id = d.parent_department_id
    LEFT JOIN users u ON u.department_id = d.id
    LEFT JOIN assets a ON a.department_id = d.id
    GROUP BY d.id, pd.name
    ORDER BY d.created_at DESC
  `);
  return rows;
};

// ─────────────────────────────────────────────────────────────
// POST /departments
// Accessible by: ADMIN ONLY
// ─────────────────────────────────────────────────────────────
const createDepartment = async ({ name, description, parent_department_id }, createdBy) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Unique name check (case-insensitive)
    const nameCheck = await client.query(
      'SELECT id FROM departments WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    if (nameCheck.rows.length > 0) {
      throw new ConflictError(`Department name '${name}' already exists`);
    }

    // 2. Parent existence check
    if (parent_department_id !== null) {
      const parentCheck = await client.query(
        'SELECT id, is_active FROM departments WHERE id = $1',
        [parent_department_id]
      );
      if (parentCheck.rows.length === 0) {
        throw new NotFoundError('Parent department not found');
      }
    }

    // 3. Insert
    const { rows } = await client.query(
      `INSERT INTO departments (name, description, parent_department_id, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $4)
       RETURNING *`,
      [name, description, parent_department_id, createdBy]
    );
    const department = rows[0];

    // 4. Activity log
    await activityLogService.createLog(client, {
      userId: createdBy,
      action: ACTIONS.DEPARTMENT_CREATED,
      entity: ENTITIES.DEPARTMENT,
      entityId: department.id,
      newValue: department,
    });

    await client.query('COMMIT');
    return department;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /departments/:id
// Accessible by: ADMIN ONLY
// ─────────────────────────────────────────────────────────────
const updateDepartment = async (id, updates, updatedBy) => {
  const { name, description, parent_department_id } = updates;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch current department (lock row for update)
    const { rows: current } = await client.query(
      'SELECT * FROM departments WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (current.length === 0) throw new NotFoundError('Department not found');
    const dept = current[0];

    // 2. Unique name check if name is being changed
    if (name !== undefined && name.toLowerCase() !== dept.name.toLowerCase()) {
      const nameCheck = await client.query(
        'SELECT id FROM departments WHERE LOWER(name) = LOWER($1) AND id != $2',
        [name, id]
      );
      if (nameCheck.rows.length > 0) {
        throw new ConflictError(`Department name '${name}' already exists`);
      }
    }

    // 3. Parent validation
    const newParent = parent_department_id !== undefined ? parent_department_id : dept.parent_department_id;
    if (newParent !== null) {
      // Self-parent check
      if (parseInt(newParent, 10) === parseInt(id, 10)) {
        throw new ValidationError('A department cannot be its own parent');
      }

      // Parent existence check
      const parentCheck = await client.query(
        'SELECT id FROM departments WHERE id = $1',
        [newParent]
      );
      if (parentCheck.rows.length === 0) {
        throw new NotFoundError('Parent department not found');
      }

      // Circular hierarchy check
      const cycleDetected = await wouldCreateCycle(client, parseInt(id, 10), newParent);
      if (cycleDetected) {
        throw new ConflictError('Setting this parent would create a circular department hierarchy');
      }
    }

    // 4. Build update query dynamically (only update provided fields)
    const finalName        = name !== undefined ? name : dept.name;
    const finalDescription = description !== undefined ? description : dept.description;
    const finalParent      = parent_department_id !== undefined ? parent_department_id : dept.parent_department_id;

    const { rows: updated } = await client.query(
      `UPDATE departments
       SET name = $1, description = $2, parent_department_id = $3,
           updated_by = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [finalName, finalDescription, finalParent, updatedBy, id]
    );

    // 5. Activity log
    await activityLogService.createLog(client, {
      userId: updatedBy,
      action: ACTIONS.DEPARTMENT_UPDATED,
      entity: ENTITIES.DEPARTMENT,
      entityId: parseInt(id, 10),
      oldValue: dept,
      newValue: updated[0],
    });

    await client.query('COMMIT');
    return updated[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /departments/:id/deactivate
// Accessible by: ADMIN ONLY
// ─────────────────────────────────────────────────────────────
const deactivateDepartment = async (id, deactivatedBy) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch and lock the department
    const { rows } = await client.query(
      'SELECT * FROM departments WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (rows.length === 0) throw new NotFoundError('Department not found');
    const dept = rows[0];

    // 2. Already inactive?
    if (!dept.is_active) {
      throw new ConflictError('Department is already inactive');
    }

    // 3. Check active employees
    const { rows: empRows } = await client.query(
      `SELECT COUNT(*) AS employee_count
       FROM users
       WHERE department_id = $1 AND status = 'active'`,
      [id]
    );
    const employeeCount = parseInt(empRows[0].employee_count, 10);

    // 4. Check active assets
    const { rows: assetRows } = await client.query(
      `SELECT COUNT(*) AS asset_count
       FROM assets
       WHERE department_id = $1 AND status != 'retired'`,
      [id]
    );
    const assetCount = parseInt(assetRows[0].asset_count, 10);

    // 5. Block deactivation if dependencies exist
    if (employeeCount > 0 || assetCount > 0) {
      const err = new ConflictError(
        'Cannot deactivate department: active employees or assets are assigned to it'
      );
      // Attach counts to the error for the controller to surface
      err.meta = { employee_count: employeeCount, asset_count: assetCount };
      throw err;
    }

    // 6. Deactivate
    const { rows: updated } = await client.query(
      `UPDATE departments
       SET is_active = FALSE, updated_by = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [deactivatedBy, id]
    );

    // 7. Activity log
    await activityLogService.createLog(client, {
      userId: deactivatedBy,
      action: ACTIONS.DEPARTMENT_DEACTIVATED,
      entity: ENTITIES.DEPARTMENT,
      entityId: parseInt(id, 10),
      oldValue: { is_active: true },
      newValue: { is_active: false },
    });

    // 8. Notify the admin who triggered it (can be extended to notify all admins)
    await notificationService.create(client, {
      userId: deactivatedBy,
      message: `Department '${dept.name}' has been deactivated.`,
      type: NOTIFICATION_TYPES.DEPARTMENT_DEACTIVATED,
      entity: ENTITIES.DEPARTMENT,
      entityId: parseInt(id, 10),
    });

    await client.query('COMMIT');
    return updated[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
};
