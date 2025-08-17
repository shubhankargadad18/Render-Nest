import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text"},
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if(!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }
                try {
                    await dbConnect();
                    const user = await User.findOne({ email: credentials.email });
                    if (!user || user.password !== credentials.password) {
                        throw new Error("Invalid User Details");
                    }
                    const isValid = await bcrypt.compare(credentials.password, user.password)

                    if (!isValid) {
                        throw new Error("Invalid email or password");
                    }
                    return {
                        id: user._id.toString(),
                        email: user.email.toString(),
                    };
                } catch (error) {
                    console.error("Authorization error:", error);
                    if (error instanceof Error && error.message.includes("MongoNetworkError")) {
                        throw new Error("Database connection error");
                    }
                    throw new Error("Internal Server Error");
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/error"
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development"
}
