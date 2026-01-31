import express from 'express';
import {
    getBranchPermissions,
    updateBranchPermissions,
    createBranchPermissions,
    getAuditLogs
} from '../controllers/superAdminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { validate } from '../middleware/validate';
import { createBranchPermissionsSchema, updateBranchPermissionsSchema, getBranchPermissionsSchema, getAuditLogsSchema } from '../validations/superAdmin';

const router = express.Router();

// Require SUPER_ADMIN for all routes
router.use(authMiddleware);
router.use(roleMiddleware(['SUPER_ADMIN']));

router.get('/permissions/:branchId', validate(getBranchPermissionsSchema), getBranchPermissions);
router.post('/permissions', validate(createBranchPermissionsSchema), createBranchPermissions);
router.put('/permissions/:branchId', validate(updateBranchPermissionsSchema), updateBranchPermissions);
router.get('/audit-logs', validate(getAuditLogsSchema), getAuditLogs);

export default router;
