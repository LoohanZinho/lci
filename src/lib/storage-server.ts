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
    
    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s/g, '_')}`;
    const filePath = `${path}/${uniqueFileName}`;
    const file = bucket.file(filePath);

    const stream = file.createWriteStream({
        metadata: {
            contentType: contentType,
        },
        resumable: false,
    });
    
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    return new Promise((resolve, reject) => {
        bufferStream.pipe(stream)
            .on('error', (err) => {
                console.error("Error during stream pipe:", err);
                reject(err);
            })
            .on('finish', async () => {
                try {
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

export async function deleteProofImage(imageUrl: string): Promise<void> {
    try {
        const bucket = storage.bucket();
        // Extract the file path from the URL
        // https://storage.googleapis.com/[BUCKET_NAME]/[FILE_PATH]
        const urlParts = imageUrl.split(bucket.name + '/');
        if (urlParts.length < 2) {
            throw new Error("URL da imagem inválida ou não pertence a este bucket.");
        }
        
        const filePath = decodeURIComponent(urlParts[1]);
        const file = bucket.file(filePath);

        await file.delete();
        console.log(`Successfully deleted ${filePath} from ${bucket.name}.`);

    } catch (error: any) {
        // Don't throw error if file not found, as it might have been deleted manually
        if (error.code === 404) {
             console.warn(`File not found during deletion, might have been already deleted: ${imageUrl}`);
             return;
        }
        console.error(`Failed to delete image ${imageUrl}.`, error);
        throw error; // Re-throw other errors
    }
}
