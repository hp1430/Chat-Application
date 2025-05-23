import { StatusCodes } from 'http-status-codes';

import channelRepository from '../repositories/channelRepository.js';
import messageRepository from '../repositories/messageRepository.js';
import ClientError from '../utils/errors/clientError.js';
import { isUserMemberOfWorkspace } from './workspaceService.js';

export const getChannelByIdService = async (channelId, userId) => {
  try {
    const channel =
      await channelRepository.getChannelWithWorkspaceDetails(channelId);
    if (!channel || !channel.workspaceId) {
      throw new ClientError({
        message: 'Channel not found for the provided id',
        explanation: 'Invalid data sent from client',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const isUserPartOfWorkspace = isUserMemberOfWorkspace(
      channel.workspaceId,
      userId
    );
    if (!isUserPartOfWorkspace) {
      throw new ClientError({
        message:
          'User is not part of the workspace and hence cannot access the channel',
        explanation: 'User is not part of the workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }

    const messages = await messageRepository.getPaginatedMessages(
      { channelId },
      1,
      20
    );

    return {
      messages,
      _id: channel._id,
      name: channel.name,
      description: channel.description,
      workspaceId: channel.workspaceId,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt
    };
  } catch (error) {
    console.log('Get channel by id error: ', error);
    throw error;
  }
};
