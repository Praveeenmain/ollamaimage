import { Message } from '../models/Message.js';

// Get all messages for a session
export const getMessages = async (req, res) => {
  try {
    const { sessionId = 'default' } = req.query;
    
    const messages = await Message.find({ sessionId })
      .sort({ timestamp: 1 })
      .lean();

    // Transform MongoDB documents to frontend format
    const transformedMessages = messages.map(msg => ({
      id: msg.messageId,
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp,
      images: msg.images || [],
      isGenerating: msg.isGenerating || false,
      error: msg.error || undefined
    }));

    res.json({
      success: true,
      data: transformedMessages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

// Save a new message
export const saveMessage = async (req, res) => {
  try {
    const { id, type, content, timestamp, images, isGenerating, error, sessionId = 'default' } = req.body;

    if (!id || !type || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, type, content'
      });
    }

    const messageData = {
      messageId: id,
      type,
      content,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      images: images || [],
      isGenerating: isGenerating || false,
      error: error || null,
      sessionId
    };

    const message = new Message(messageData);
    await message.save();

    res.status(201).json({
      success: true,
      data: {
        id: message.messageId,
        type: message.type,
        content: message.content,
        timestamp: message.timestamp,
        images: message.images,
        isGenerating: message.isGenerating,
        error: message.error
      }
    });
  } catch (error) {
    console.error('Error saving message:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Message with this ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to save message'
    });
  }
};

// Update an existing message (useful for updating generating status)
export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, images, isGenerating, error } = req.body;

    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (images !== undefined) updateData.images = images;
    if (isGenerating !== undefined) updateData.isGenerating = isGenerating;
    if (error !== undefined) updateData.error = error;

    const message = await Message.findOneAndUpdate(
      { messageId: id },
      updateData,
      { new: true, lean: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: message.messageId,
        type: message.type,
        content: message.content,
        timestamp: message.timestamp,
        images: message.images,
        isGenerating: message.isGenerating,
        error: message.error
      }
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update message'
    });
  }
};

// Delete all messages for a session (clear chat history)
export const clearMessages = async (req, res) => {
  try {
    const { sessionId = 'default' } = req.query;
    
    const result = await Message.deleteMany({ sessionId });
    
    res.json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error clearing messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear messages'
    });
  }
};