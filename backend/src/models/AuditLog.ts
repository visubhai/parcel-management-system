import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    entityType: string;
    entityId: string;
    briefContext?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'PASSWORD_RESET'
    entityType: { type: String, required: true }, // e.g., 'Booking', 'User', 'Branch', 'Permission'
    entityId: { type: String, required: true },
    briefContext: { type: String, maxlength: 200 },
    ipAddress: { type: String },
    userAgent: { type: String }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 60 }); // 60 days
AuditLogSchema.index({ entityId: 1, entityType: 1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
