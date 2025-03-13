import Channel from '../schema/channel.js';
import crudRepository from './crudRepository';

const channelRepository = {
  ...crudRepository(Channel)
};

export default channelRepository;
