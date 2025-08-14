import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { dbConnect } from "@/lib/db";

export async function POST(request: NextRequest) { 
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }
        
        await dbConnect();
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already registered" }, { status: 400 });
        } else {
            await User.create({ email, password });
            return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
        }
    } catch (error) {
        console.error("Registration error:", error);
        if (error instanceof Error && error.message.includes("MongoNetworkError")) {
            return NextResponse.json({ error: "Database connection error" }, { status: 500 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}