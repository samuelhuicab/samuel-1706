import { Router } from 'express';
import { createCharge } from '../cotrollers/snailpay.controller';

export const snailpayRouter = Router();

snailpayRouter.post('/charges', createCharge);