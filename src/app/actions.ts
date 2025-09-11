'use server';

import { storage } from '@/lib/firebase-admin';
import { randomUUID } from 'crypto';

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File | null;
  const influencerId = formData.get('influencerId') as string | null;

  if (!file) {
    throw new Error('Nenhum arquivo encontrado.');
  }
  if (!influencerId) {
    throw new Error('ID do influenciador não fornecido.');
  }

  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const filePath = `influencer-proofs/${influencerId}/${fileName}`;

    const bucket = storage.bucket();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await bucket.file(filePath).save(fileBuffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          firebaseStorageDownloadTokens: randomUUID(),
        },
      },
    });

    const [url] = await bucket.file(filePath).getSignedUrl({
        action: 'read',
        expires: '01-01-2500' // Far future expiration date
    });
    
    // A URL gerada inclui o token de download, tornando-a publicamente acessível.
    // O formato é diferente do que o SDK do cliente gera, mas funciona da mesma forma.
    // Ex: https://storage.googleapis.com/[BUCKET_NAME]/[FILE_PATH]
    return url;

  } catch (error: any) {
    console.error('Erro de upload no servidor:', error);
    // Se o erro for relacionado a credenciais, vamos logar uma mensagem mais específica.
    if (error.code === 'MISSING_CREDENTIALS') {
        console.error("As credenciais do Admin SDK não foram encontradas. Verifique a variável de ambiente GOOGLE_APPLICATION_CREDENTIALS no servidor.");
        throw new Error("Erro de configuração do servidor ao fazer upload.");
    }
    throw new Error(`Falha no upload do servidor: ${error.message}`);
  }
}
