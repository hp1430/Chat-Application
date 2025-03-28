import express from 'express';

import {
  emailVerificationCodeRequestController,
  emailVerificationController,
  signIn,
  signUp
} from '../../controllers/userController.js';
import {
  userSignInSchema,
  userSignUpSchema
} from '../../validators/userSchema.js';
import { validate } from '../../validators/zodValidator.js';

const router = express.Router();

router.post('/signup', validate(userSignUpSchema), signUp);
router.post('/signin', validate(userSignInSchema), signIn);
router.post('/verify', emailVerificationCodeRequestController);
router.put('/verify/:token', emailVerificationController);

export default router;
