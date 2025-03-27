import { StatusCodes } from 'http-status-codes';

import {
  passwordResetService,
  requestPasswordResetService
} from '../services/passwordResetService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObjects.js';

export const requestPasswordResetController = async (req, res) => {
  try {
    const response = await requestPasswordResetService(req.body.email);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Password reset mail sent successfully'));
  } catch (error) {
    console.log('Request Password Reset Controller error', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const passwordResetController = async (req, res) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const { id, token } = req.query;
    const response = await passwordResetService(token, req.body.password);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Password updated successfully'));
  } catch (error) {
    console.log('Password Reset Controller error', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
