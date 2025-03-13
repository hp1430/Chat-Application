import { StatusCodes } from 'http-status-codes';

import User from '../schema/user.js';
import Workspace from '../schema/workspace.js';
import ClientError from '../utils/errors/clientError.js';
import channelRepository from './channelRepository.js';
import crudRepository from './crudRepository.js';

const workspaceRepository = {
  ...crudRepository(Workspace),
  getWorkspaceByName: async function (workspaceName) {
    const workspace = await Workspace.findOne({ name: workspaceName });

    if (!workspace) {
      throw new ClientError({
        expanation: 'Invalid data sent from the client',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    return workspace;
  },
  getWorkspaceByJoinCode: async function (joinCode) {
    const workspace = await Workspace.findOne({ joinCode });

    if (!workspace) {
      throw new ClientError({
        expanation: 'Invalid data sent from the client',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    return workspace;
  },
  addMemberToWorkspace: async function (workspaceId, memberID, role) {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw new ClientError({
        expanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const isValidUser = await User.findById(memberID);

    if (!isValidUser) {
      throw new ClientError({
        expanation: 'Invalid data sent from the client',
        message: 'User not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const isMemberAlreadyAdded = workspace.members.find(
      (member) => member.memberID === memberID
    );

    if (isMemberAlreadyAdded) {
      throw new ClientError({
        expanation: 'Invalid data sent from the client',
        message: 'User is already a member of the workspace',
        statusCode: StatusCodes.FORBIDDEN
      });
    }

    workspace.members.push({
      memberID,
      role
    });

    await workspace.save();

    return workspace;
  },
  addChannelToWorkspace: async function (workspaceId, channelName) {
    const workspace =
      await Workspace.findById(workspaceId).populate('channels');

    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    const isChannelAlreadyAdded = workspace.channels.find(
      (channel) => channel.name === channel.name
    );

    if (isChannelAlreadyAdded) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Channel is already added to the workspace',
        statusCode: StatusCodes.FORBIDDEN
      });
    }

    const channel = await channelRepository.create({
      name: channelName
    });

    workspace.channels.push(channel);
    await workspace.save();

    return workspace;
  },
  fetchAllWorkspaceByMemberId: async function (memberId) {
    const workspaces = await Workspace.find({
      'members.memberId': memberId
    }).populate('members.memberId', 'username, email, avatar');

    return workspaces;
  }
};

export default workspaceRepository;
