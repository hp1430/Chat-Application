import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

import channelRepository from '../repositories/channelRepository.js';
import userRepository from '../repositories/userRepository.js';
import workspaceRepository from '../repositories/workspaceRepository.js';
import ClientError from '../utils/errors/clientError.js';
import ValidationError from '../utils/errors/validationError.js';

const isUserAdminOfWorkspace = (workspace, userId) => {
  return workspace.members.find(
    (member) => member.memberId.toString() === userId && member.role === 'admin'
  );
};

const isUserMemberOfWorkspace = (workspace, userId) => {
  return workspace.members.find((member) => member.memberId.toString() === userId);
};

const isChannelAlreadyPartOfWorkspace = (workspace, channelName) => {
  return workspace.channels.find(
    (channel) => channel.name.toLowerCase() === channelName.toLowerCase()
  );
};

export const createWorkspaceService = async (workspaceData) => {
  try {
    const joinCode = uuidv4().substring(0, 6).toUpperCase();

    const response = await workspaceRepository.create({
      name: workspaceData.name,
      description: workspaceData.description,
      joinCode
    });

    console.log("______", workspaceData.owner)

    await workspaceRepository.addMemberToWorkspace(
      response._id,
      workspaceData.owner,
      'admin'
    );

    const updateWorkspace = await workspaceRepository.addChannelToWorkspace(
      response._id,
      'general'
    );

    return updateWorkspace;
  } catch (error) {
    console.log('Create Workspace Service Error: ', error);
    if (error.name === 'ValidationError') {
      throw new ValidationError(
        {
          error: error.errors
        },
        error.message
      );
    }
    if (error.name === 'MongoServerError' && error.code === 11000) {
      throw new ValidationError(
        {
          error: ['A workspace with same details already exists']
        },
        'A workspace with same details already exists'
      );
    }
  }
};

export const getWorkspacesUserIsMemberOfService = async (userId) => {
  try {
    const response =
      await workspaceRepository.fetchAllWorkspaceByMemberId(userId);
    return response;
  } catch (error) {
    console.log('Get Workspaces User Is Member Of Service Error: ', error);
    throw error;
  }
};

export const deleteWorkspaceService = async (workspaceId, userId) => {
  try {
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Workspace not found',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isAllowed = isUserAdminOfWorkspace(workspace, userId);
    if (isAllowed) {
      await channelRepository.deleteMany(workspace.channels);
      const response = await workspaceRepository.delete(workspaceId);
      return response;
    }
    throw new ClientError({
      explanation:
        'User is either not an admin or not a member of the workspace',
      message: 'User is not allowed to delete the workspace',
      statusCode: StatusCodes.UNAUTHORIZED
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getWorkspaceService = async (workspaceId, userId) => {
  console.log("userId in getWorkspaceService", userId);
  try {
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isMember = isUserMemberOfWorkspace(workspace, userId);
    if (!isMember) {
      throw new ClientError({
        explanation: 'User is not member of workspace',
        message: 'User is not member of workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    return workspace;
  } catch (error) {
    console.log('Get workspace service error', error);
    throw error;
  }
};

export const getWorkspaceByJoinCodeService = async (joinCode, userId) => {
  try {
    const workspace =
      await workspaceRepository.getWorkspaceByJoinCode(joinCode);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isMember = isUserMemberOfWorkspace(workspace, userId);
    if (!isMember) {
      throw new ClientError({
        explanation: 'User is not member of workspace',
        message: 'User is not member of workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    return workspace;
  } catch (error) {
    console.log('Get workspace by joincode service error', error);
    throw error;
  }
};

export const updateWorkspaceService = async (
  workspaceId,
  workspaceData,
  userId
) => {
  try {
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isAdmin = isUserAdminOfWorkspace(workspace, userId);
    if (!isAdmin) {
      throw new ClientError({
        explanation: 'User is not admin of workspace',
        message: 'User is not admin of workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    const updatedWorkspace = await workspaceRepository.update(
      workspaceId,
      workspaceData
    );
    return updatedWorkspace;
  } catch (error) {
    console.log('Update workspace service error', error);
    throw error;
  }
};

export const addMemberToWorkspaceService = async (
  workspaceId,
  memberId,
  role,
  userId
) => {
  try {
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const isAdmin = isUserAdminOfWorkspace(workspace, userId);
    if(!isAdmin) {
      throw new ClientError({
        explanation: 'User is not an admin of the workspace',
        message: 'User is not an admin of the workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      })
    }
    const isValidUser = await userRepository.getById(memberId);
    if (!isValidUser) {
      throw new ClientError({
        explanation: 'Invalid data sent from client',
        message: 'User not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isMember = isUserMemberOfWorkspace(workspace, memberId);
    if (isMember) {
      throw new ClientError({
        explanation: 'User is already member of workspace',
        message: 'User is already member of workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    const response = await workspaceRepository.addMemberToWorkspace(
      workspaceId,
      memberId,
      role
    );
    return response;
  } catch (error) {
    console.log('Add member to workspace service error', error);
    throw error;
  }
};

export const addChannelToWorkspaceService = async (
  workspaceId,
  channelName,
  userId
) => {
  try {
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    const isAdmin = isUserAdminOfWorkspace(userId);
    if (!isAdmin) {
      throw new ClientError({
        explanation: 'User is not admin of workspace',
        message: 'User is not admin of workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    const isChannelPartOfWorkspace = isChannelAlreadyPartOfWorkspace(
      workspace,
      channelName
    );
    if (isChannelPartOfWorkspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from client',
        message: 'Channel already part of workspace',
        statusCode: StatusCodes.FORBIDDEN
      });
    }
    const response = await workspaceRepository.addChannelToWorkspace(
      workspaceId,
      channelName
    );
    return response;
  } catch (error) {
    console.log('Add channel to workspace service error', error);
    throw error;
  }
};
