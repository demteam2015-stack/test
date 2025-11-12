'use client';

const CONFIG_STORAGE_KEY = 'demyanenko_hub_config';

export type AppConfig = {
    [key: string]: string;
};

// --- Helper Functions ---

const getConfig = (): AppConfig => {
    if (typeof window === 'undefined') return {};
    try {
        const storedData = localStorage.getItem(CONFIG_STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : {};
    } catch (e) {
        console.error("Failed to read config:", e);
        return {};
    }
};

const saveConfig = (config: AppConfig) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
        console.error("Failed to save config:", e);
    }
};

// --- Public API ---

/**
 * Gets a configuration value.
 */
export const getConfigValue = (key: string, defaultValue: string): string => {
    const config = getConfig();
    return config[key] ?? defaultValue;
};

/**
 * Sets a configuration value.
 */
export const setConfigValue = (key: string, value: string): void => {
    const config = getConfig();
    config[key] = value;
    saveConfig(config);
};
