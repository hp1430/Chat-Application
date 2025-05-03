import express from 'express';

import {
  getMessagesController,
  getPresignedUrlFromAWS
} from '../../controllers/messageController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/pre-signed-url', isAuthenticated, getPresignedUrlFromAWS);

router.get('/:channelId', isAuthenticated, getMessagesController);

export default router;
