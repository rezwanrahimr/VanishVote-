const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  hideResults: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  reactions: {
    likes: {
      type: Number,
      default: 0
    },
    trending: {
      type: Number,
      default: 0
    }
  },
  comments: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  pollType: {
    type: String,
    enum: ['multiple-choice', 'yes-no'],
    required: true
  },
  uniqueLink: {
    type: String,
    required: true,
    unique: true
  },
  totalVotes: {
    type: Number,
    default: 0
  }
});

// Automatically delete expired polls
PollSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Poll', PollSchema);