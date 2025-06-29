import express from 'express';
import { getMessages, saveMessage, updateMessage, clearMessages } from '../controllers/messageController.js';

const router = express.Router();

// GET /api/messages - Get all messages for a session
router.get('/', getMessages);

// POST /api/messages - Save a new message
router.post('/', saveMessage);

// PUT /api/messages/:id - Update an existing message
router.put('/:id', updateMessage);

// DELETE /api/messages - Clear all messages for a session
router.delete('/', clearMessages);

export default router;