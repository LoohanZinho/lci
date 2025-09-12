
import { storage } from './firebase-admin';
import { Readable } from 'stream';

const BUCKET_NAME = "studio-324918385-59672.appspot.com";

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
    if (!BUCKET_NAME) {
      reject(new Error("O nome do bucket do Firebase Storage não está definido."));
      return;
    }
    const bucket = storage.bucket(BUCKET_NAME);
    const filePath = `influencer-proofs/${influencerId}/${Date.now()}-${fileName}`;
    const bucketFile = bucket.file(filePath);

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
          // A URL de download com token é mais segura que a pública
          const [signedUrl] = await bucketFile.getSignedUrl({
            action: 'read',
            expires: '03-09-2491', // Uma data de expiração muito longa no futuro
          });
          resolve(signedUrl);
        } catch (error) {
          console.error('Erro ao gerar a URL assinada:', error);
          reject(new Error('Falha ao obter a URL do arquivo.'));
        }
      });
  });
};


/**
 * Deleta uma imagem do Firebase Storage com base em sua URL.
 * @param imageUrl - A URL completa da imagem a ser deletada.
 */
export const deleteProofImageByUrl = async (imageUrl: string): Promise<void> => {
    if (!imageUrl || !BUCKET_NAME) {
      console.warn("URL da imagem ou nome do bucket não fornecido, pulando deleção.");
      return;
    }
    
    const bucket = storage.bucket(BUCKET_NAME);

    try {
        const decodedUrl = decodeURIComponent(imageUrl);
        // Extrai o caminho do objeto da URL, seja ela assinada ou pública
        // Ex: .../o/influencer-proofs%2F... -> influencer-proofs/...
        const pathRegex = new RegExp(`\/o\/(.*?)\\?`);
        const match = decodedUrl.match(pathRegex);
        
        let filePath = '';
        if (match && match[1]) {
            filePath = match[1];
        } else {
            // Tenta como URL pública
            const publicUrlPrefix = `https://storage.googleapis.com/${BUCKET_NAME}/`;
            if (decodedUrl.startsWith(publicUrlPrefix)) {
                filePath = decodedUrl.substring(publicUrlPrefix.length);
            }
        }

        if (!filePath) {
           console.warn(`Não foi possível extrair o caminho do arquivo da URL: ${imageUrl}. Pulando a deleção.`);
           return;
        }

        await bucket.file(filePath).delete();
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
