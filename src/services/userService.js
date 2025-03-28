import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import { BASE_URL } from '../config/serverConfig.js';
import { addEmailToMailQueue } from '../producers/mailQueueProducer.js';
import userRepository from '../repositories/userRepository.js';
import { createJWT, verifyJWT } from '../utils/common/authUtils.js';
import { emailVerificationMail } from '../utils/common/mailObject.js';
import ClientError from '../utils/errors/clientError.js';
import ValidationError from '../utils/errors/validationError.js';

export const signUpService = async (data) => {
  try {
    const newUser = await userRepository.create(data);

    emailVerificationCodeRequestService(data.email);

    return newUser;
  } catch (error) {
    console.log('Error in signUpService: ', error);
    if (error.name === 'ValidationError') {
      throw new ValidationError(
        {
          error: error.errors
        },
        error.message
      );
    }
    const mongoError = error.cause || error;

    if (mongoError.name === 'MongoServerError' && mongoError.code === 11000) {
      throw new ValidationError(
        {
          error: ['User already exists']
        },
        'User already exists'
      );
    }
    throw new Error('Unexpected error in signUpService');
  }
};

export const signInService = async (data) => {
  try {
    const user = await userRepository.getByEmail(data.email);
    if (!user) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'No registered user found with this email',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    if (!user.isVerified) {
      throw new ClientError({
        explanation: 'Email id is not verified',
        message: 'Email id is not verified',
        statusCode: StatusCodes.FORBIDDEN
      });
    }

    // match the incoming password with the hashed password in the database
    const isMatch = bcrypt.compareSync(data.password, user.password);

    if (!isMatch) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Incorrect password',
        statusCode: StatusCodes.BAD_REQUEST
      });
    }

    return {
      username: user.username,
      avatar: user.avatar,
      email: user.email,
      token: createJWT({ id: user._id, email: user.email })
    };
  } catch (error) {
    console.log('User Service Error', error);
    throw error;
  }
};

export const emailVerificationService = async (token) => {
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
    const verifiedUser = await userRepository.update(user._id, {
      isVerified: true
    });
    return verifiedUser;
  } catch (error) {
    console.log('Email Verification Service error', error);
    throw error;
  }
};

export const emailVerificationCodeRequestService = (email) => {
  try {
    const token = createJWT({ email: email });
    const verificationURL = `${BASE_URL}/users/verify/${token}`;
    addEmailToMailQueue({
      ...emailVerificationMail(verificationURL),
      to: email
    });
  } catch (error) {
    console.log('Email Verification Code Request Service error', error);
    throw error;
  }
};
