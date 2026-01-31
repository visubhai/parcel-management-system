import AuditLog from '../models/AuditLog';
import { Request } from 'express';

interface AuditParams {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: any;
    newValue?: any;
    req?: Request;
}

export const logAudit = async ({
    userId,
    action,
    entityType,
    entityId,
    oldValue,
    newValue,
    req
}: AuditParams) => {
    try {
        await AuditLog.create({
            userId,
            action,
            entityType,
            entityId,
            oldValue,
            newValue,
            ipAddress: req?.ip,
            userAgent: req?.headers['user-agent']
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // We don't throw here to avoid failing the main request if logging fails
    }
};
