const { query } = require('../../config/db');

const getKpis = async () => {
  const [assetStatusRows, assetCountsRows, allocationCountsRows, bookingCountsRows, transferCountsRows, maintenanceCountsRows] = await Promise.all([
    query(`
      SELECT status, COUNT(*)::int AS count
      FROM assets
      GROUP BY status
      ORDER BY status
    `),
    query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'available')::int AS "assetsAvailable",
        COUNT(*) FILTER (WHERE status = 'allocated')::int AS "assetsAllocated"
      FROM assets
    `),
    query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'active')::int AS "activeAllocations",
        COUNT(*) FILTER (
          WHERE status = 'active'
            AND expected_return_date IS NOT NULL
            AND expected_return_date >= NOW()
            AND expected_return_date <= NOW() + INTERVAL '7 days'
        )::int AS "upcomingReturns"
      FROM allocations
    `),
    query(`
      SELECT
        COUNT(*) FILTER (WHERE status IN ('upcoming', 'ongoing'))::int AS "activeBookings"
      FROM bookings
    `),
    query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'requested')::int AS "pendingTransfers"
      FROM transfer_requests
    `),
    query(`
      SELECT
        COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int AS "maintenanceToday"
      FROM maintenance_requests
    `),
  ]);

  return {
    ...(assetCountsRows.rows[0] || {}),
    ...(allocationCountsRows.rows[0] || {}),
    ...(bookingCountsRows.rows[0] || {}),
    ...(transferCountsRows.rows[0] || {}),
    ...(maintenanceCountsRows.rows[0] || {}),
    assetStatusBreakdown: assetStatusRows.rows,
  };
};

const getOverdue = async () => {
  const { rows } = await query(`
    SELECT
      COUNT(*)::int AS count
    FROM allocations
    WHERE status = 'overdue'
       OR (status = 'active' AND expected_return_date IS NOT NULL AND expected_return_date < NOW() AND actual_return_date IS NULL)
  `);

  return { count: rows[0]?.count ?? 0 };
};

module.exports = {
  getKpis,
  getOverdue,
};