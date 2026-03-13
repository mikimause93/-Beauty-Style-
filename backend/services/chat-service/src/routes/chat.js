const express = require('express');
const Message = require('../utils/messageModel');

const router = express.Router();

/**
 * GET /api/chat/:conversationId/messages
 * Load message history for a conversation.
 */
router.get('/:conversationId/messages', async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { before, limit = 50 } = req.query;

    const query = { conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
