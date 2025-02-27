import User from "../models/user.js";
import crudRepository from "./crudRepository.js";

const userRepository = {
    ...crudRepository(User),
    getByEmail: async function (email) {
        const user = await User.findOne({ email });
        return user;
    },
    getByUserName: async function (userName) {
        const user = await User.findOne({ userName });
        return user;
    }
};

export default userRepository;