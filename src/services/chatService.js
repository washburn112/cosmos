import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

const CHAT_COLLECTION = 'chat_history';

export const chatService = {
  async sendMessage(userId, message, context = {}) {
    try {
      // In a real implementation, this would call the Grok AI API
      // For now, we'll simulate a response
      const response = await this.simulateGrokResponse(message, context);

      // Store the chat history
      await addDoc(collection(db, CHAT_COLLECTION), {
        userId,
        message,
        response,
        context,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getChatHistory(userId, limit = 50) {
    try {
      const q = query(
        collection(db, CHAT_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },

  // Simulated Grok AI response
  async simulateGrokResponse(message, context) {
    // This is a placeholder for the actual Grok AI API integration
    // In a real implementation, you would:
    // 1. Format the message and context for the Grok API
    // 2. Make an API call to Grok
    // 3. Process and return the response

    const lowerMessage = message.toLowerCase();
    
    // Simple response simulation based on message content
    if (lowerMessage.includes('revenue')) {
      return `Based on the available data, the revenue for ${context.companyName || 'the selected company'} is $1,234,567.`;
    } else if (lowerMessage.includes('ebitda')) {
      return `The EBITDA margin for ${context.companyName || 'the selected company'} is 15.2%.`;
    } else if (lowerMessage.includes('headcount')) {
      return `The current headcount is 150 employees, which represents a 10% increase from last quarter.`;
    } else if (lowerMessage.includes('cashflow')) {
      return `The operating cashflow for the last quarter was $500,000, showing a positive trend.`;
    } else {
      return `I understand you're asking about ${message}. Could you please provide more context about what specific information you're looking for?`;
    }
  },

  // Helper function to format context for Grok AI
  formatContextForGrok(context) {
    return {
      companyId: context.companyId,
      investmentId: context.investmentId,
      dateRange: context.dateRange,
      metrics: context.metrics,
    };
  },
}; 