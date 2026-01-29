# 📚 Parcel Management System - Documentation Pack

## 1. System Overview
**Product Name**: ABCD Logistics Platform (Enterprise Edition)
**Version**: 1.0.0 (Commercial Release)
**Architecture**: Next.js 15 (Frontend) + MongoDB (Database) + NextAuth (Authentication)

This system is a multi-tenant logistics ERP designed for transport companies to manage booking, dispatch, and delivery of parcels across multiple branches. It features Role-Based Access Control (RBAC), real-time reporting, and financial tracking.

---

## 2. 👥 User Manuals

### A. Super Admin Manual
**Login**: Access `/login`. Default credentials provided during setup.
**Key Responsibilities**:
1.  **Branch Management**: Create/Edit branches in Settings -> Branch Management.
2.  **User Management**: Create Admins for each branch. Assign them strictly to one branch.
3.  **System Health**: Monitor `/dashboard/super-admin/system-health` for errors and audit logs.
4.  **Reports**: View "Revenue Report" to track total income across all branches.

### B. Admin (Branch Manager) Manual
**Login**: Use credentials provided by Super Admin.
**Key Workflows**:
1.  **Booking a Parcel**: 
    - Go to "New Booking".
    - Select "Receiver Branch" (Destination).
    - Enter Sender/Receiver details. Use the autocomplete to find frequent customers.
    - Add items (Cartons/Sacks).
    - Click "Book Parcel". A PDF receipt will auto-generate.
2.  **Inbound Management**:
    - Go to "Inbound".
    - You will see parcels sent *to your branch* from others.
    - Click "Receive" when physical goods arrive. Status changes to `ARRIVED`.
3.  **Delivery**:
    - When customer comes to collect, find the parcel in "Inbound".
    - Click "Deliver". Status changes to `DELIVERED`.
    - If "To Pay", collect cash before clicking Deliver.

---

## 3. 🚀 Deployment Guide

### A. Environment Setup
Create a `.env.local` (and set in Vercel Environment Variables):
```env
MONGODB_URI=your-mongodb-connection-string
AUTH_SECRET=your-nextauth-secret
```

### B. Database Migration (MongoDB)
1.  Ensure MongoDB instance is running.
2.  Seed initial data using the admin seeding script: `npm run seed`.

### C. Vercel Deployment
1.  Connect GitHub repo to Vercel.
2.  Add Environment Variables.
3.  Deploy.
4.  **Domain**: Add Custom Domain in Vercel Settings -> Domains.

---

## 4. 🔐 Security & Operations

### A. Data Backup
- **MongoDB Atlas**: Automatic backups are enabled by default on paid clusters.
- **Manual Dump**: Use `mongodump` for manual backups.

### B. Disaster Recovery
- **RPO (Recovery Point Objective)**: Depends on MongoDB configuration (Replica Sets).
- **RTO (Recovery Time Objective)**: Fast failover with Replica Sets.

### C. Compliance
- **GDPR**: Supported via soft deletes where applicable.
- **Audit Logs**: Sensitive actions are logged.

---

## 5. ❓ FAQ & Troubleshooting

**Q: I cannot see any parcels.**
A: Check if you are logged in. If you are an Admin, you only see parcels related to your branch.

**Q: "Permission Denied" error.**
A: You tried to perform an action not allowed for your role (e.g., Admin trying to delete a user).

**Q: A user is locked out.**
A: Super Admin can update user status via the User Management dashboard.
