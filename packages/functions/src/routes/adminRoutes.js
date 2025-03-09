import Router from 'koa-router';
import userController from '../controllers/userController.js';
import { validate, validateVerifyRequest, validatePaginationParams } from '../validators/userValidator.js';
import productController from '../controllers/productController.js';

const router = new Router();

// User management routes
router.get('/users', validate(validatePaginationParams, 'query'), userController.getAllUsers);
router.get('/users/pending', userController.getPendingUsers);
router.get('/users/:userId', userController.getUserDetails);
router.post('/users', userController.createUser);
router.post('/users/:userId/verify', validate(validateVerifyRequest), userController.verifyUser);
router.delete('/users/:userId', userController.deleteUser);

// Thêm routes mới cho import sản phẩm
router.post('/products/import', productController.importProducts);
router.get('/products/import-templates', productController.getImportTemplate);
router.get('/products/import-status/:importId', productController.getImportStatus);

export default router; 