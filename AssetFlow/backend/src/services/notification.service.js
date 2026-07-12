// ============================================================
// notification.service.js
// Shared service — inserts a notification row.
// Call this inside every state-changing transaction BEFORE commit.
// ============================================================

/**
 * Creates a notification record.
 *
 * @param {object} client    - pg transaction client OR the pool/query client
 * @param {object} params
 * @param {string} params.userId    - Recipient user UUID
 * @param {string} params.message   - Human-readable notification message
 * @param {string} params.type      - Valid notification_type ENUM value
 * @param {string} [params.relatedEntityType]  - Type of the related entity (e.g. 'asset')
 * @param {string} [params.relatedEntityId]    - UUID of the related entity
 */
const create = async (client, { userId, message, type, relatedEntityType = null, relatedEntityId = null }) => {
  await client.query(
    `INSERT INTO notifications (user_id, message, type, related_entity_type, related_entity_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, message, type, relatedEntityType, relatedEntityId]
  );
};

module.exports = { create };
