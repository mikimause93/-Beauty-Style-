const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String },
    content: { type: String },
    mediaUrl: { type: String },
    messageType: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'VOICE', 'VIDEO', 'SYSTEM'],
      default: 'TEXT',
    },
    translatedContent: { type: String },
    originalLang: { type: String },
    targetLang: { type: String },
    readAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
