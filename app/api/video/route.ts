import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Video, { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET() { 
    try {

        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();
        const videos = await Video.find({}).sort({ createdAt: -1 }).lean();

        if (!videos || videos.length === 0) {
            return Response.json([], { status: 200 });
        }

        return Response.json(videos, { status: 200 });

    } catch (error) {
        return Response.json(
            { error: `Failed to fetch videos: ${error}` },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) { 
    try {
        
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const body: IVideo = await request.json();

        if( !body.title || !body.description || !body.videoUrl || !body.thumbnailUrl ) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const videoData: IVideo = {
            ...body,
            controls: body?.controls ?? true,
            transformation: {
                height: 1920,
                width: 1080,
                quality: body?.transformation?.quality ?? 100
            },
        }

        const newVideo = await Video.create(videoData);

        return Response.json(newVideo, { status: 201 });

    } catch (error) {
        return Response.json(
            { error: `Failed to create video: ${error}` },
            { status: 500 }
        );
    }
}