
import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

const firebaseConfig = {
  "projectId": "studio-324918385-59672",
  "storageBucket": "studio-324918385-59672.appspot.com",
};

let auth: Auth;
let db: Firestore;
let storage: Storage;

// Garante que a inicialização ocorra apenas uma vez.
if (!admin.apps.length) {
  try {
    // No Firebase App Hosting, as credenciais são detectadas automaticamente.
    // Localmente, você precisa configurar a variável de ambiente GOOGLE_APPLICATION_CREDENTIALS.
    admin.initializeApp({
      storageBucket: firebaseConfig.storageBucket,
    });
    console.log("Firebase Admin SDK inicializado com sucesso.");
  } catch (error: any) {
    console.error("Erro CRÍTICO ao inicializar o Firebase Admin SDK:", error.message);
    // Se a inicialização falhar, as operações subsequentes irão quebrar.
    // Isso é esperado se o ambiente não estiver configurado corretamente.
  }
}

try {
  auth = admin.auth();
  db = admin.firestore();
  storage = admin.storage();
} catch (error) {
    console.error("Falha ao obter serviços do Admin SDK. O SDK não foi inicializado corretamente?", error);
    // Para evitar que a aplicação quebre na importação se a inicialização falhou,
    // exportamos objetos vazios. As chamadas a eles falharão, mas a aplicação iniciará.
    auth = {} as Auth;
    db = {} as Firestore;
    storage = {} as Storage;
}

export { auth, db, storage };
