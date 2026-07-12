const { successResponse } = require('../../utils/response');
const { query } = require('../../config/db');

const getActivityLogs = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const { rows } = await query(
      `SELECT
         id,
         user_id AS "userId",
         action,
         entity_type AS "entityType",
         entity_id AS "entityId",
         metadata,
         created_at AS "createdAt"
       FROM activity_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    successResponse(res, rows, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivityLogs,
};