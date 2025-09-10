import { Request, Response } from 'express';

export const ping = (_req: Request, res: Response) => {
  res.json({ message: 'pong 🏓' });
};
