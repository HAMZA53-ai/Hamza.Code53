
const USER_NAME_KEY = 'hamzaSuperPlusUserName';

export const saveUserName = (name: string): void => {
    try {
        localStorage.setItem(USER_NAME_KEY, name);
    } catch (e) { 
        console.error("Failed to save user name", e); 
    }
};

export const getUserName = (): string | null => {
    try {
        return localStorage.getItem(USER_NAME_KEY);
    } catch (e) { 
        console.error("Failed to get user name", e); 
        return null; 
    }
};
