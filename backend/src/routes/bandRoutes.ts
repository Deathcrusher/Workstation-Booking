import { Router } from 'express';
import {
  createBand,
  getBands,
  updateBand,
  deleteBand,
} from '../controllers/bandController';

const router = Router();

router.post('/', createBand);
router.get('/', getBands);
router.put('/:id', updateBand);
router.delete('/:id', deleteBand);

export default router; 