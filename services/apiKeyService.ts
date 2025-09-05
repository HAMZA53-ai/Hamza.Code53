const GEMINI_API_KEY = 'hamzaSuperPlusUserApiKey';
const OPENAI_API_KEY = 'hamzaSuperPlusOpenAiApiKey';
const DEEPSEEK_API_KEY = 'hamzaSuperPlusDeepSeekApiKey';


// --- Gemini ---
export const saveGeminiApiKey = (key: string): void => {
  try {
    localStorage.setItem(GEMINI_API_KEY, key);
  } catch (error) {
    console.error("Failed to save Gemini API key to localStorage", error);
  }
};

export const getGeminiApiKey = (): string | null => {
  try {
    return localStorage.getItem(GEMINI_API_KEY);
  } catch (error) {
    console.error("Failed to get Gemini API key from localStorage", error);
    return null;
  }
};

export const clearGeminiApiKey = (): void => {
  try {
    localStorage.removeItem(GEMINI_API_KEY);
  } catch (error) {
    console.error("Failed to clear Gemini API key from localStorage", error);
  }
};

// --- OpenAI ---
export const saveOpenAIApiKey = (key: string): void => {
  try {
    localStorage.setItem(OPENAI_API_KEY, key);
  } catch (error) {
    console.error("Failed to save OpenAI API key to localStorage", error);
  }
};

export const getOpenAIApiKey = (): string | null => {
  try {
    return localStorage.getItem(OPENAI_API_KEY);
  } catch (error) {
    console.error("Failed to get OpenAI API key from localStorage", error);
    return null;
  }
};

export const clearOpenAIApiKey = (): void => {
  try {
    localStorage.removeItem(OPENAI_API_KEY);
  } catch (error) {
    console.error("Failed to clear OpenAI API key from localStorage", error);
  }
};

// --- DeepSeek ---
export const saveDeepSeekApiKey = (key: string): void => {
  try {
    localStorage.setItem(DEEPSEEK_API_KEY, key);
  } catch (error) {
    console.error("Failed to save DeepSeek API key to localStorage", error);
  }
};

export const getDeepSeekApiKey = (): string | null => {
  try {
    return localStorage.getItem(DEEPSEEK_API_KEY);
  } catch (error) {
    console.error("Failed to get DeepSeek API key from localStorage", error);
    return null;
  }
};

export const clearDeepSeekApiKey = (): void => {
  try {
    localStorage.removeItem(DEEPSEEK_API_KEY);
  } catch (error) {
    console.error("Failed to clear DeepSeek API key from localStorage", error);
  }
};
