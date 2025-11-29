const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Editor', 'Viewer'], default: 'Admin' },
  plan: { type: String, enum: ['Free', 'Pro', 'Agency'], default: 'Free' },
  stripeCustomerId: String,
  brandVoices: [{
    name: String,
    description: String,
    examples: [String]
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);