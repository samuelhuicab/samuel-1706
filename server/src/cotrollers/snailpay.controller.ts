import type { Request, Response } from 'express';
import { processCharge } from '../services/snailpay.service';

export async function createCharge(req: Request, res: Response): Promise<void> {
    const result = await processCharge(req.body);
    res.status(result.httpStatus).json(result.body);
}