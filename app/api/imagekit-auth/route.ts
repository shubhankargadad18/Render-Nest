import { getUploadAuthParams } from '@imagekit/next/server';

export async function GET() {
    try {
        const authParameters = getUploadAuthParams({
            publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY as string,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
        });
    
        return Response.json({
            authParameters,
            publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY,
        });
    } catch (error) {
        return Response.json(
            { error: `Failed to generate upload auth parameters: ${error}` },
            { status: 500 }
        );
    }
 }