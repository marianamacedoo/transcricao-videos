import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase.config";

// exporta uma função assíncrona que age como um middleware
export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).user = decoded; // salva user no request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
