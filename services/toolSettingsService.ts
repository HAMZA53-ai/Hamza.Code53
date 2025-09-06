
import { ToolSettings } from '../types';

const SETTINGS_KEY = 'hamzaSuperPlusToolSettings';

export const getToolSettings = (): ToolSettings => {
  try {
    const rawSettings = localStorage.getItem(SETTINGS_KEY);
    return rawSettings ? JSON.parse(rawSettings) : {};
  } catch (error) {
    console.error("Failed to parse tool settings from localStorage", error);
    return {};
  }
};

export const saveToolSettings = (settings: ToolSettings): void => {
  try {
    const rawSettings = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_KEY, rawSettings);
  } catch (error) {
    console.error("Failed to save tool settings to localStorage", error);
  }
};
