import admin from 'firebase-admin';

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


if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: firebaseConfig.storageBucket,
    });
    console.log("Firebase Admin SDK inicializado com sucesso.");
  } catch (error: any) {
    console.error("Erro ao inicializar o Firebase Admin SDK:", error);
    // Em um ambiente de desenvolvimento sem credenciais, isso pode falhar.
    // A aplicação deve lidar com isso graciosamente.
  }
}

let auth, db, storage;

try {
  auth = admin.auth();
  db = admin.firestore();
  storage = admin.storage();
} catch (error) {
    console.error("Falha ao exportar serviços do Admin SDK. O SDK foi inicializado corretamente?", error);
    // Isso pode acontecer se a inicialização falhou.
    // As chamadas para essas variáveis falharão, mas pelo menos o app não quebra na importação.
}

export { auth, db, storage };