import { storage } from './firebase-admin';
import { Readable } from "stream";

interface UploadParams {
    fileBuffer: Buffer;
    fileName: string;
    contentType: string;
    path: string;
}

export async function uploadProofImage({ fileBuffer, fileName, contentType, path }: UploadParams): Promise<string> {
    const bucket = storage.bucket();
    
    const uniqueFileName = `${Date.now()}-${fileName}`;
    const filePath = `${path}/${uniqueFileName}`;
    const file = bucket.file(filePath);

    const stream = file.createWriteStream({
        metadata: {
            contentType: contentType,
        },
        resumable: false,
    });
    
    // Convert buffer to stream and pipe it
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null); // Signal end of stream

    return new Promise((resolve, reject) => {
        bufferStream.pipe(stream)
            .on('error', (err) => {
                console.error("Error during stream pipe:", err);
                reject(err);
            })
            .on('finish', async () => {
                try {
                    // Make the file public and get the URL
                    await file.makePublic();
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
                    resolve(publicUrl);
                } catch (err) {
                    console.error("Error making file public:", err);
                    reject(err);
                }
            });
    });
}
