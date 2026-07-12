// ============================================================
// activityLog.service.js
// Shared service — inserts a row into activity_logs.
// Call this inside every state-changing transaction BEFORE commit.
// ============================================================

/**
 * Creates an activity log entry.
 *
 * @param {object} client  - pg transaction client (pool.connect())
 * @param {object} params
 * @param {string} params.userId       - UUID of the user performing the action
 * @param {string} params.action       - Action name, e.g. 'asset.allocated'
 * @param {string} params.entityType   - Type of entity, e.g. 'department'
 * @param {string} params.entityId     - UUID of the affected row
 * @param {object} [params.metadata]   - Additional metadata JSON object
 */
const createLog = async (client, { userId, action, entityType, entityId, metadata = {} }) => {
  await client.query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, action, entityType, entityId, metadata ? JSON.stringify(metadata) : '{}']
  );
};

module.exports = { createLog };
