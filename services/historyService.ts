import { Conversation } from '../types';

const HISTORY_KEY = 'hamzaSuperPlusChatHistory';

export const getHistory = (): Conversation[] => {
  try {
    const rawHistory = localStorage.getItem(HISTORY_KEY);
    if (rawHistory) {
      const parsedHistory: Conversation[] = JSON.parse(rawHistory);
      // Sort by timestamp descending to show newest first
      return parsedHistory.sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (error) {
    console.error("Failed to parse chat history from localStorage", error);
    // If parsing fails, clear the corrupted data
    localStorage.removeItem(HISTORY_KEY);
    return [];
  }
};

export const saveHistory = (history: Conversation[]): void => {
  try {
    const rawHistory = JSON.stringify(history);
    localStorage.setItem(HISTORY_KEY, rawHistory);
  } catch (error) {
    console.error("Failed to save chat history to localStorage", error);
  }
};
