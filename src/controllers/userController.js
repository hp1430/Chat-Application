import statusCodes, { StatusCodes } from 'http-status-codes';

import {
  emailVerificationCodeRequestService,
  emailVerificationService,
  signInService,
  signUpService
} from '../services/userService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObjects.js';

export const signUp = async (req, res) => {
  try {
    const user = await signUpService(req.body);
    return res
      .status(statusCodes.CREATED)
      .json(successResponse(user, 'User created successfully'));
  } catch (error) {
    console.log('Error in signUp: ', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const signIn = async (req, res) => {
  try {
    const response = await signInService(req.body);
    return res
      .status(statusCodes.OK)
      .json(successResponse(response, 'User signed in successfully'));
  } catch (error) {
    console.log('User controller error', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const emailVerificationController = async (req, res) => {
  try {
    const token = req.params.token;
    console.log(token);
    const response = await emailVerificationService(token);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Email verified successfully'));
  } catch (error) {
    console.log('User controller error', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const emailVerificationCodeRequestController = (req, res) => {
  try {
    emailVerificationCodeRequestService(req.body.email);
    return res
      .status(StatusCodes.OK)
      .json({ message: 'Email Verification code sent successfully' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
