import express from 'express';

import {
  passwordResetController,
  requestPasswordResetController
} from '../../controllers/passwordResetController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/request', isAuthenticated, requestPasswordResetController);
router.put('/', isAuthenticated, passwordResetController);

export default router;
