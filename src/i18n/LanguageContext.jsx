import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('appLanguage') || 'pl';
    });

    useEffect(() => {
        localStorage.setItem('appLanguage', language);
    }, [language]);

    const t = (key, params = {}) => {
        let text = translations[language][key] || key;

        // Handle simple parameter replacement like {{count}}
        Object.keys(params).forEach(param => {
            text = text.replace(`{{${param}}}`, params[param]);
        });

        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
