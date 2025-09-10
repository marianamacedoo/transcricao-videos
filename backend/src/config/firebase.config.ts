import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!admin.apps.length && keyPath) {
  const serviceAccount = require(path.resolve(keyPath));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default admin;