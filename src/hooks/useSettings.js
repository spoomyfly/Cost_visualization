import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'appSettings';

const defaultSettings = {
    rememberLastEntry: false
};

const loadSettings = () => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        return stored ? { ...defaultSettings, ...JSON.parse(stored) } : { ...defaultSettings };
    } catch {
        return { ...defaultSettings };
    }
};

export const useSettings = () => {
    const [settings, setSettings] = useState(loadSettings);

    useEffect(() => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return { settings, updateSetting };
};
