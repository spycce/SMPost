const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true // relaxed for now as we don't have full auth
  },
  platform: {
    type: String,
    required: true,
    enum: ['Twitter', 'LinkedIn', 'Instagram', 'Facebook']
  },
  content: {
    type: String,
    required: true
  },
  hashtags: [{
    type: String
  }],
  imagePrompt: {
    type: String
  },
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Published', 'Failed'],
    default: 'Draft'
  },
  scheduledDate: {
    type: Date
  },
  engagementScore: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);