# System Architecture & Database Design

## 1. High-Level Architecture
The system uses a **Supabase (PostgreSQL)** backend with a strict **Row Level Security (RLS)** model. The frontend (Next.js) communicates directly with Supabase via the client SDK. Authentication is handled by Supabase Auth (`auth.users`), which maps 1:1 to our custom `app_users` table for role management.

### Data Flow
1. **User Login**: User authenticates via Supabase Auth.
2. **Context**: Database identifies user via `auth.uid()`.
3. **Authorization**: PostgreSQL triggers RLS policies using the user's ID to fetch their role (`SUPER_ADMIN` or `ADMIN`) and assigned `branch_id` from the `app_users` table.
4. **Data Access**:
    - `SUPER_ADMIN`: Bypass filters (policy: `true`).
    - `ADMIN`: Filter data where `branch_id` matches their assigned branch.

## 2. Entity-Relationship Diagram (ERD)

- **branches**
    - `id` (UUID, PK)
    - `branch_code` (Text, Unique) - e.g., 'BR01'
    - `name` (Text)
    
- **app_users**
    - `id` (UUID, PK, FK -> auth.users.id)
    - `role` (ENUM: SUPER_ADMIN, ADMIN)
    - `branch_id` (UUID, FK -> branches.id) - Nullable for Super Admin
    
- **parcels**
    - `id` (UUID, PK)
    - `lr_number` (Text, Unique)
    - `from_branch_id` (FK -> branches)
    - `to_branch_id` (FK -> branches)
    - `status` (ENUM: BOOKED, IN_TRANSIT, ARRIVED, DELIVERED, CANCELLED)
    - `payment_status` (ENUM: PAID, TO_PAY)
    
- **parcel_items**
    - `id` (PK)
    - `parcel_id` (FK -> parcels)
    - `name`, `qty`, `weight`, `rate`
    
- **lr_sequences**
    - `branch_id` (FK -> branches, PK)
    - `current_sequence` (Int) - Used for atomic LR generation
    
- **audit_logs**
    - `id` (PK)
    - `table_name`, `record_id`, `action` (INSERT/UPDATE/DELETE)
    - `performed_by` (FK -> auth.users)
    - `timestamp`

## 3. Security Model (RLS)

| Table | Role | Policy | Description |
|-------|------|--------|-------------|
| `branches` | SUPER_ADMIN | ALL | Full access |
| `branches` | ADMIN | SELECT | Can specific branch details |
| `parcels` | SUPER_ADMIN | ALL | Full access |
| `parcels` | ADMIN | SELECT | Visible if `from_branch` or `to_branch` is own branch |
| `parcels` | ADMIN | INSERT | Only if `from_branch` is owner branch |
| `parcels` | ADMIN | UPDATE | Restrictive based on status (e.g., origin can edit, dest can receive) |
| `app_users`| SUPER_ADMIN | ALL | Manage users |
| `app_users`| ADMIN | SELECT | Read-only (Manage via Super Admin) |

## 4. Key Functions

### `generate_lr_number(branch_id)`
Atomic function to generate gap-free sequences per branch.
Format: `{BRANCH_CODE}/{SEQUENCE}` (e.g., `SUR/10001`).
- Locks the `lr_sequences` row for the specific branch.
- Increments sequence.
- Returns formatted string.

### `handle_audit_log()`
Trigger function attached to all sensitive tables (`parcels`, `app_users`, `payments`).
- Automatically captures `auth.uid()`, `OLD` and `NEW` data, and operation type.
