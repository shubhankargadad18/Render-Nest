import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env'
    )
}

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

export async function dbConnect() { 
    if (cached.conn) {
        return cached.conn
    }
    
    if (!cached.promise) { 
        const opts = {
            bufferCommands: true,
            maxPoolSize: 10
        }
        mongoose
            .connect(MONGODB_URI, opts)
            .then(() => mongoose.connection)
    }

    try {
        cached.conn = await cached.promise
        return cached.conn
    } catch (error) { 
        console.error('Failed to connect to MongoDB:', error)
        throw new Error('Failed to connect to MongoDB')
    }
}