const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  subscriptionUntil: {
    type: Date,
  },
  lastLoginDate: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: 'basic',
    enum: ["basic", "supervisor", "admin"]
  },
  accessToken: {
    type: String
  },
  subscriptionStatus: {
    type: String,
    default: 'active',
    enum: ["active", "inactive"]
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
