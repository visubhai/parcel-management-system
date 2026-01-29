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
                password: { label: "Password", type: "password" }
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
                        { username: credentials.email } // credentials.email captures the input
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
                token.role = user.role;
                token.branchId = user.branchId;
                token.branchName = user.branchName;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.role = token.role;
                session.user.branchId = token.branchId;
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
