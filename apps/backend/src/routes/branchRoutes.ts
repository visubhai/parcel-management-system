import express from 'express';
import { getBranches } from '../controllers/branchController';
import { validate } from '../middleware/validate';
import { getBranchesSchema } from '../validations/branch';

const router = express.Router();

// GET /api/branches is public (used for login)
router.get('/', validate(getBranchesSchema), getBranches);

export default router;
