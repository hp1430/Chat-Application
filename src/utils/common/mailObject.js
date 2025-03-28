import { MAIL_ID } from '../../config/serverConfig.js';

export const workspaceJoinMail = function (workspace) {
  return {
    from: MAIL_ID,
    subject: 'You have been added to a workspace',
    text: `Congratulations! You have been added to the workspace ${workspace.name}`
  };
};

export const passwordResetMail = function (resetURL) {
  return {
    from: MAIL_ID,
    subject: 'Password Reset Request',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      ${resetURL}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`
  };
};

export const emailVerificationMail = function (verficationURL) {
  return {
    from: MAIL_ID,
    subject: 'Email Verification',
    text: `Thanks for signing up! To complete your registration, please click the link below to verify your email address:\n\n
      ${verficationURL}\n\n`
  };
};
