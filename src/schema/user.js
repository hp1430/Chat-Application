import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

/* eslint-disable no-useless-escape */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Email already exists'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: [true, 'Username already exists'],
      match: [/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric'],
      minlength: [3, 'Username must be at least 3 characters long']
    },
    avatar: {
      type: String
    },
    isVerified: {
      type: Boolean,
      required: [true, 'Email Verification is required'],
      default: false
    }
  },
  { timestamps: true }
);
/* eslint-enable no-useless-escape */

userSchema.pre('save', function saveUser(next) {
  const user = this;
  const salt = bcrypt.genSaltSync(9);
  const hashedPassword = bcrypt.hashSync(this.password, salt);
  user.password = hashedPassword;
  user.avatar = `https://robohash.org/${user.username}`;
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
