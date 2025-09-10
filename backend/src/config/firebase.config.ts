import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT || '';
if (keyPath && fs.existsSync(path.resolve(keyPath))) {
  admin.initializeApp({
    credential: admin.credential.cert(require(path.resolve(keyPath)))
  });
} else {
  // não inicializa (somente protótipo)
  // console.warn('FIREBASE_SERVICE_ACCOUNT não configurado corretamente');
}

export default admin;
