import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export declare function middleware(req: NextRequest): Promise<NextResponse<unknown>>;
export declare const config: {
    matcher: string[];
};
