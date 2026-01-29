import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/backend/db';
import User from '@/backend/models/User';
import Branch from '@/backend/models/Branch';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                branchId: { label: "Branch", type: "text" }
            },
            async authorize(credentials) {
                await connectDB();

                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Missing credentials');
                }

                // Support login by Email OR Username
                const user = await User.findOne({
                    $or: [
                        { email: credentials.email },
                        { username: credentials.email },
                    ]
                }).select('+password +role +branch').populate('branch');

                if (!user) {
                    throw new Error('User not found');
                }

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValid) {
                    throw new Error('Invalid password');
                }

                // Branch Validation
                if (credentials.branchId) {
                    // If user has a branch assigned, it must match the selected branch
                    if (user.branch && user.branch._id.toString() !== credentials.branchId) {
                        throw new Error('User does not belong to this branch');
                    }
                    // If user is supposed to be in a branch (e.g. STAFF) but has no branch assigned in DB, deny?
                    // Or if user is NOT in a branch (e.g. potentially global admin), but attempts to login to a specific branch?
                    // For now, strict check: if user has a branch, it must match.

                    // Also, if the user is linked to a branch, but selects a DIFFERENT branch, deny.

                    // What if user is SUPER_ADMIN with no branch? 
                    // If user.branch is null/undefined, and they selected a branch...
                    // Usually SUPER_ADMIN can login anywhere. 
                    // Let's allow SUPER_ADMIN to login effectively anywhere OR restrict them if they have no branch?
                    // Context: "make login page so we login through different branches"
                    // The requirement implies filtering access.
                    // Safe bet: If user.branch exists, keys must match.

                    if (user.branch && user.branch._id.toString() !== credentials.branchId) {
                        throw new Error(`Access denied. You belong to ${user.branch.name}`);
                    }

                    // If user DOES NOT have a branch (e.g. Global Admin), allowing them to login "via" a branch 
                    // might be confusing if we set session.branchId to the selected one?
                    // Re-reading original `auth.ts`:
                    // branchId: user.branch?._id?.toString() || null,
                    // branchName: user.branch?.name || 'Global',
                    // The session reflects the USER'S configured branch, not necessarily the one they "logged in via".
                    // However, if we want to "login through different branches", maybe the session should reflect the SELECTED branch?
                    // But the User model ties a user to a *single* branch. 
                    // So "login through different branches" probably clarifies "Select your branch to verify you are at the right place".

                    // I will stick to: Validate user belongs to the branch if user has a branch.
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    branchId: user.branch?._id?.toString() || null,
                    branchName: user.branch?.name || 'Global',
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.branchId = (user as any).branchId;
                token.branchName = (user as any).branchName;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                // @ts-ignore
                session.user.role = token.role;
                // @ts-ignore
                session.user.branchId = token.branchId;
                // @ts-ignore
                session.user.branchName = token.branchName;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt'
    }
});
