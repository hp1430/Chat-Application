import Channel from '../schema/channel.js';
import crudRepository from './crudRepository.js';

const channelRepository = {
  ...crudRepository(Channel),
  getChannelWithWorkspaceDetails: async (channelId) => {
    const channel = await Channel.findById(channelId).populate('workspaceId');
    return channel;
  }
};

export default channelRepository;
