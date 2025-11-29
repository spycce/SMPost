const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['Instagram', 'Twitter', 'LinkedIn', 'Facebook'], required: true },
  content: { type: String, required: true },
  imageUrl: String,
  imagePrompt: String,
  hashtags: [String],
  scheduledDate: Date,
  status: { type: String, enum: ['Draft', 'Scheduled', 'Published', 'Failed'], default: 'Draft' },
  engagementScore: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);