import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT || ""));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
