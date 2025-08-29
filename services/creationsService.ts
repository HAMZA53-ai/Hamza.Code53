
import { Creation } from '../types';

const CREATIONS_KEY = 'hamzaSuperPlusCreations';

export const getCreations = (): Creation[] => {
  try {
    const rawCreations = localStorage.getItem(CREATIONS_KEY);
    if (rawCreations) {
      const parsed: Creation[] = JSON.parse(rawCreations);
      return parsed.sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (error) {
    console.error("Failed to parse creations from localStorage", error);
    localStorage.removeItem(CREATIONS_KEY);
    return [];
  }
};

const saveCreations = (creations: Creation[]): void => {
  try {
    const rawCreations = JSON.stringify(creations);
    localStorage.setItem(CREATIONS_KEY, rawCreations);
  } catch (error) {
    console.error("Failed to save creations to localStorage", error);
  }
};

export const addCreation = (creation: Omit<Creation, 'id' | 'timestamp'>): string => {
  const creations = getCreations();
  const newCreation: Creation = {
    ...creation,
    id: `creation-${Date.now()}`,
    timestamp: Date.now(),
  };
  saveCreations([newCreation, ...creations]);
  return newCreation.id;
};

export const updateCreation = (id: string, updates: Partial<Creation>): void => {
  const creations = getCreations();
  const index = creations.findIndex(c => c.id === id);
  if (index !== -1) {
    creations[index] = { ...creations[index], ...updates };
    saveCreations(creations);
  }
};
