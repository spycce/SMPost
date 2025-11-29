const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['Twitter', 'LinkedIn', 'Instagram', 'Facebook']
  },
  handle: {
    type: String,
    default: ''
  },
  connected: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: ''
  },
  accessToken: {
    type: String,
    default: ''
  },
  lastSync: {
    type: String
  }
});

module.exports = mongoose.model('Account', AccountSchema);
