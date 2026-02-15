import express from 'express';
import {
    getCounters,
    updateCounter,
    getBranchPermissions,
    updateBranchPermissions,
    createBranchPermissions,
    getAuditLogs,
    hardDeleteBooking
} from './super-admin.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { validate } from '../middleware/validate';
import {
    createBranchPermissionsSchema,
    updateBranchPermissionsSchema,
    getBranchPermissionsSchema,
    getAuditLogsSchema
} from './super-admin.validation';

const router = express.Router();

// Require SUPER_ADMIN for all routes
router.use(authMiddleware);
router.use(roleMiddleware(['SUPER_ADMIN']));

router.get('/counters', getCounters);
router.put('/counters/:id', updateCounter);
router.get('/permissions/:branchId', validate(getBranchPermissionsSchema), getBranchPermissions);
router.post('/permissions', validate(createBranchPermissionsSchema), createBranchPermissions);
router.put('/permissions/:branchId', validate(updateBranchPermissionsSchema), updateBranchPermissions);
router.get('/audit-logs', validate(getAuditLogsSchema), getAuditLogs);
router.delete('/bookings/:id', hardDeleteBooking);

export default router;
