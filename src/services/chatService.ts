const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string[];
}

export const chatService = {
  // Fetch all messages for a session
  async getMessages(sessionId: string = 'default') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages?sessionId=${sessionId}`);
      const result: ApiResponse<any[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch messages');
      }
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Save a new message
  async saveMessage(message: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      const result: ApiResponse<any> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save message');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  },

  // Update an existing message
  async updateMessage(messageId: string, updates: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const result: ApiResponse<any> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update message');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  },

  // Clear all messages for a session
  async clearMessages(sessionId: string = 'default') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<any> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to clear messages');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error clearing messages:', error);
      throw error;
    }
  },

  // Check if backend is available
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
};