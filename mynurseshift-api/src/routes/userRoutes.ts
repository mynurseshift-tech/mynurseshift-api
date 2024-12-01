import express from 'express';
import { userController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Routes publiques
router.post('/login', userController.login);
router.post('/register', userController.createUser);

// Routes protégées
router.use(authenticate);

// Routes pour les admins et super admins
router.get('/', authorize(['ADMIN', 'SUPERADMIN']), userController.getAllUsers);
router.get('/:id', authorize(['ADMIN', 'SUPERADMIN']), userController.getUserById);
router.put('/:id', authorize(['ADMIN', 'SUPERADMIN']), userController.updateUser);
router.delete('/:id', authorize(['ADMIN', 'SUPERADMIN']), userController.deleteUser);

// Routes uniquement pour les super admins
router.post('/:id/approve', authorize(['SUPERADMIN']), userController.approveUser);

export default router;
