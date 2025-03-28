import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import { BASE_URL } from '../config/serverConfig.js';
import { addEmailToMailQueue } from '../producers/mailQueueProducer.js';
import userRepository from '../repositories/userRepository.js';
import { createJWT, verifyJWT } from '../utils/common/authUtils.js';
import { passwordResetMail } from '../utils/common/mailObject.js';
import ClientError from '../utils/errors/clientError.js';

export const requestPasswordResetService = async (email) => {
  try {
    const user = await userRepository.getByEmail(email);
    if (!user) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'No registered user found with this email',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const token = createJWT({ id: user._id, email: user.email });

    const resetURL = `${BASE_URL}/passwordreset?id=${user._id}&token=${token}`;

    addEmailToMailQueue({
      ...passwordResetMail(resetURL),
      to: user.email
    });
  } catch (error) {
    console.log('Request password reset service error', error);
    throw error;
  }
};

export const passwordResetService = async (token, password) => {
  try {
    const userData = verifyJWT(token);
    const user = await userRepository.getByEmail(userData.email);
    if (!user) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'No registered user found with this email',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const salt = bcrypt.genSaltSync(9);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const updatedUser = await userRepository.update(user._id, {
      password: hashedPassword
    });
    console.log(updatedUser);
    return updatedUser;
  } catch (error) {
    console.log('Password reset service error', error);
    throw error;
  }
};
