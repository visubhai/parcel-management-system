import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    entityType: string;
    entityId: string;
    oldValue: any;
    newValue: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'PASSWORD_RESET'
    entityType: { type: String, required: true }, // e.g., 'Booking', 'User', 'Branch', 'Permission'
    entityId: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
