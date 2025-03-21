import User from '../schema/user.js';
import crudRepository from './crudRepository.js';

const userRepository = {
  ...crudRepository(User),
  getByEmail: async function (email) {
    const user = await User.findOne({ email }).select('+password'); // Excluding password from the response
    return user;
  },
  getByUsername: async function (username) {
    const user = await User.findOne({ username }).select('-password');
    return user;
  }
};

export default userRepository;
