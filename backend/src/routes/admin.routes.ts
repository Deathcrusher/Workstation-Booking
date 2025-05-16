import { Router } from 'express';
import { 
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// User management routes
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router; 