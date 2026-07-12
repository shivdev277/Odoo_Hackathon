const { ASSET_STATUS } = require('./constants');

const validTransitions = {
  [ASSET_STATUS.AVAILABLE]: [ASSET_STATUS.ALLOCATED, ASSET_STATUS.IN_MAINTENANCE, ASSET_STATUS.RETIRED, ASSET_STATUS.MISSING],
  [ASSET_STATUS.ALLOCATED]: [ASSET_STATUS.AVAILABLE, ASSET_STATUS.IN_MAINTENANCE, ASSET_STATUS.MISSING],
  [ASSET_STATUS.IN_MAINTENANCE]: [ASSET_STATUS.AVAILABLE, ASSET_STATUS.RETIRED],
  [ASSET_STATUS.RETIRED]: [],
  [ASSET_STATUS.MISSING]: [ASSET_STATUS.AVAILABLE, ASSET_STATUS.RETIRED]
};

const canTransition = (currentStatus, newStatus) => {
  const allowed = validTransitions[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
};

module.exports = { canTransition };
