import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

export const logAction = async ({ user, action, targetType, targetId, details }) => {
  try {
    await AuditLog.create({
      user,
      action,
      targetType,
      targetId,
      details: details || {},
    });
  } catch (err) {
    logger.error(`Audit log failed: ${err.message}`, {
      action,
      targetType,
      targetId,
    });
  }
};
