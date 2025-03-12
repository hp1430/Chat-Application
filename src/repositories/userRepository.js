import User from '../schema/user.js';
import crudRepository from './crudRepository.js';

const userRepository = {
  ...crudRepository(User),
  getByEmail: async function (email) {
    const user = await User.findOne({ email }).select('+password'); // Excluding password from the response
    return user;
  },
  getByUserName: async function (userName) {
    const user = await User.findOne({ userName }).select('-password');
    return user;
  }
};

export default userRepository;
