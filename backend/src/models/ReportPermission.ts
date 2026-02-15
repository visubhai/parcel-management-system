import mongoose, { Schema, Document } from 'mongoose';

export interface IReportPermission extends Document {
    branchId: mongoose.Types.ObjectId;
    allowedReports: string[];
    createdBy: mongoose.Types.ObjectId;
}

const ReportPermissionSchema = new Schema<IReportPermission>({
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, unique: true },
    allowedReports: [{
        type: String,
        enum: ["DAILY_REPORT", "DELIVERY_REPORT", "LEDGER_REPORT", "SUMMARY_REPORT", "BOOKING_REPORT"]
    }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.models.ReportPermission || mongoose.model<IReportPermission>('ReportPermission', ReportPermissionSchema);
