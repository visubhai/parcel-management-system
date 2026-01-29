import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            role: string;
            branchId?: string | null;
            branchName?: string | null;
        } & DefaultSession["user"]
    }

    interface User {
        role: string;
        branchId?: string | null;
        branchName?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string;
        branchId?: string | null;
        branchName?: string | null;
    }
}
