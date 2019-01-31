const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  image: String,
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  },
  expiresDateCheck: {
    type: Date,
    default: undefined,
    expires: 86400
  },
  passwordExp: {
    type: Date,
    // required: true
  }
}, {
  timestamps: true
});

UserSchema.plugin(passportLocalMongoose, {
  limitAttempts: true,
  interval: 100,
  // 300000ms is 5 min
  maxInterval: 300000,
  // This will completely lock out an account and requires user intervention.
  maxAttempts: 10,
  usernameField: 'email',
});

module.exports = mongoose.model('User', UserSchema);