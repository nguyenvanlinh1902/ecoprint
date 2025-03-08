import Router from 'koa-router';
import userController from '../controllers/userController.js';
import { validate, validateVerifyRequest, validatePaginationParams } from '../validators/userValidator.js';

const router = new Router();

// User management routes
router.get('/users', validate(validatePaginationParams, 'query'), userController.getAllUsers);
router.get('/users/pending', userController.getPendingUsers);
router.get('/users/:userId', userController.getUserDetails);
router.post('/users', userController.createUser);
router.post('/users/:userId/verify', validate(validateVerifyRequest), userController.verifyUser);
router.delete('/users/:userId', userController.deleteUser);

export default router; 