const express = require('express');
const router = express.Router();
const databaseService = require('../services/database');

// Get chat messages for a room
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await databaseService.getChatMessages(roomId, parseInt(limit), parseInt(offset));
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, userId } = req.body;

    if (!content || !userId) {
      return res.status(400).json({ error: 'Content and userId are required' });
    }

    const message = await databaseService.createChatMessage(roomId, userId, content);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get online users in a room (placeholder for now)
router.get('/rooms/:roomId/online-users', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // For now, return empty array - we'll implement real-time presence later
    res.json([]);
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ error: 'Failed to fetch online users' });
  }
});

module.exports = router;
