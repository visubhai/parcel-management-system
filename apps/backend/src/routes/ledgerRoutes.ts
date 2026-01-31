import express from 'express';
import { addTransaction, getTransactions } from '../controllers/ledgerController';

const router = express.Router();

router.post('/', addTransaction);
router.get('/', getTransactions);

export default router;
