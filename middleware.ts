import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware() {
        return NextResponse.next();
    },
    {
        callbacks: {
            async authorized({ req, token }) {
                const { pathname } = req.nextUrl;
                if (pathname.startsWith("/api/auth") || pathname === "/register" || pathname === "/login") {
                    return true;
                }
                if(pathname==="/" || pathname.startsWith("/api/videos/")) {
                    return true;
                }

                return !!token; //equivalent to if(token) { return true; } 
            },
        },
    }
);


export const config = {
    matcher: [
        /**
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image files)
         * - favicon.ico (favicon)
         * - public (public files)
         */
        "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    ],
};
