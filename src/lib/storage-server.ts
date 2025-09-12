
import { storage } from './firebase-admin';
import { Readable } from 'stream';

const BUCKET_NAME = storage.bucket().name;

/**
 * Faz upload de um arquivo para o Firebase Storage usando um stream.
 * @param fileStream - Um Readable stream do conteúdo do arquivo.
 * @param fileName - O nome original do arquivo.
 * @param contentType - O MIME type do arquivo.
 * @param influencerId - O ID do influenciador para organizar em pastas.
 * @returns A URL de download pública do arquivo.
 */
export const uploadProofImage = (
  fileStream: Readable,
  fileName: string,
  contentType: string,
  influencerId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const filePath = `influencer-proofs/${influencerId}/${Date.now()}-${fileName}`;
    const bucketFile = storage.bucket().file(filePath);

    const writeStream = bucketFile.createWriteStream({
      metadata: {
        contentType: contentType,
      },
    });

    fileStream
      .pipe(writeStream)
      .on('error', (error) => {
        console.error('Erro durante o streaming para o GCS:', error);
        reject(new Error('Falha ao salvar o arquivo no Storage.'));
      })
      .on('finish', async () => {
        try {
          // Tornar o arquivo público para leitura
          await bucketFile.makePublic();
          // Obter a URL pública
          const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${filePath}`;
          resolve(publicUrl);
        } catch (error) {
          console.error('Erro ao tornar o arquivo público:', error);
          reject(new Error('Falha ao obter a URL pública do arquivo.'));
        }
      });
  });
};


/**
 * Deleta uma imagem do Firebase Storage com base em sua URL.
 * @param imageUrl - A URL completa da imagem a ser deletada.
 */
export const deleteProofImageByUrl = async (imageUrl: string): Promise<void> => {
    if (!imageUrl) return;

    try {
        // Extrai o caminho do objeto da URL do GCS
        // Ex: https://storage.googleapis.com/BUCKET_NAME/path/to/object.jpg -> path/to/object.jpg
        const urlPrefix = `https://storage.googleapis.com/${BUCKET_NAME}/`;
        if (!imageUrl.startsWith(urlPrefix)) {
            // Se não for uma URL pública do GCS, tenta extrair o caminho de uma URL com token
            const decodedUrl = decodeURIComponent(imageUrl);
            const pathRegex = new RegExp(`${BUCKET_NAME}\/o\/(.*?)\\?alt=media`);
            const match = decodedUrl.match(pathRegex);
            
            if (match && match[1]) {
                const filePath = match[1];
                await storage.bucket().file(filePath).delete();
                console.log(`Imagem (com token) deletada com sucesso: ${filePath}`);
                return;
            }
            throw new Error("Formato de URL da imagem não reconhecido.");
        }
        
        const filePath = imageUrl.substring(urlPrefix.length);
        await storage.bucket().file(filePath).delete();
        console.log(`Imagem deletada com sucesso: ${filePath}`);

    } catch (error: any) {
        if (error.code === 404 || error.code === 'storage/object-not-found') {
            console.warn(`Imagem não encontrada no storage, pode já ter sido deletada: ${imageUrl}`);
        } else {
            console.error("Erro ao deletar imagem do storage:", error);
            throw new Error("Falha ao deletar a imagem do servidor.");
        }
    }
};

