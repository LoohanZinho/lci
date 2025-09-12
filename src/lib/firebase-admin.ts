
import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

// Esta configuração é para o SDK do Admin, que roda no servidor.
// Ele obtém as credenciais das variáveis de ambiente do servidor.

const firebaseConfig = {
  "projectId": "studio-324918385-59672",
  "appId": "1:315068066482:web:f17a0ae92d4a0b1100f7ab",
  "storageBucket": "studio-324918385-59672.appspot.com",
  "apiKey": "AIzaSyA9sRKoMAT9ySFBoqF83j01XILP8cQIXtc",
  "authDomain": "studio-324918385-59672.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "315068066482"
};

// Check if the environment variable for service account is available
const hasServiceAccount = !!process.env.FIREBASE_SERVICE_ACCOUNT;

if (!admin.apps.length) {
  try {
    if (hasServiceAccount) {
      // Production environment: Use service account credentials from environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: firebaseConfig.storageBucket,
      });
      console.log("Firebase Admin SDK inicializado com Service Account.");
    } else {
      // Development environment: Use Application Default Credentials
      admin.initializeApp({
        storageBucket: firebaseConfig.storageBucket,
      });
      console.log("Firebase Admin SDK inicializado com Application Default Credentials (dev).");
    }
  } catch (error: any) {
    console.error("Erro ao inicializar o Firebase Admin SDK:", error.message);
    // Em um ambiente de desenvolvimento sem credenciais, isso pode falhar.
    // A aplicação deve lidar com isso graciosamente.
  }
}

let auth: Auth;
let db: Firestore;
let storage: Storage;

// Ensure services are exported, even if initialization failed, to prevent app crashes on import.
try {
  auth = admin.auth();
  db = admin.firestore();
  storage = admin.storage();
} catch (error) {
    console.error("Falha ao obter serviços do Admin SDK. O SDK foi inicializado corretamente?", error);
    // This can happen if initialization failed.
    // To prevent the entire app from crashing on import, we define empty mocks.
    auth = {} as Auth;
    db = {} as Firestore;
    storage = {} as Storage;
}

export { auth, db, storage };
