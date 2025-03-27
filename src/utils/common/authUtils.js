import jwt from 'jsonwebtoken';

import { JWT_EXPIRY, JWT_SECRET } from '../../config/serverConfig.js';

export const createJWT = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

export const verifyJWT = (token) => {
  try {
    const response = jwt.verify(token, JWT_SECRET);
    return response;
  } catch (error) {
    console.log('JWT Verification error', error);
    throw error;
  }
};
