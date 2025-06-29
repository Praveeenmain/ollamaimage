import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  images: [imageSchema],
  isGenerating: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  sessionId: {
    type: String,
    default: 'default'
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ sessionId: 1, timestamp: 1 });

export const Message = mongoose.model('Message', messageSchema);