import express from 'express';

import {
  passwordResetController,
  requestPasswordResetController
} from '../../controllers/passwordResetController.js';

const router = express.Router();

router.post('/request', requestPasswordResetController);
router.put('/', passwordResetController);

export default router;
