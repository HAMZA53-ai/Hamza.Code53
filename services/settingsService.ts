
const THEME_KEY = 'hamzaSuperPlusTheme';
const DEV_MODE_KEY = 'hamzaSuperPlusDevMode';
type Theme = 'light' | 'dark';

export const getTheme = (): Theme => {
  try {
    const theme = localStorage.getItem(THEME_KEY) as Theme | null;
    // Default to system preference if no theme is explicitly set
    if (!theme) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
    return theme;
  } catch (error) {
    console.error("Failed to get theme from localStorage", error);
    // Fallback to light theme on error
    return 'light';
  }
};

export const setTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error)
 {
    console.error("Failed to save theme to localStorage", error);
  }
};

export const getDeveloperMode = (): boolean => {
    try {
        const devMode = localStorage.getItem(DEV_MODE_KEY);
        return devMode === 'true';
    } catch (error) {
        console.error("Failed to get developer mode from localStorage", error);
        return false;
    }
};

export const setDeveloperMode = (isDevMode: boolean): void => {
    try {
        localStorage.setItem(DEV_MODE_KEY, String(isDevMode));
    } catch (error) {
        console.error("Failed to save developer mode to localStorage", error);
    }
};
