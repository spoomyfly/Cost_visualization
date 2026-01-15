import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const DataRetrieval = ({ onImport }) => {
    const { t } = useLanguage();
    const [isImporting, setIsImporting] = useState(false);
    const [jsonInput, setJsonInput] = useState('');

    const handleSave = () => {
        onImport(jsonInput);
        setIsImporting(false);
        setJsonInput('');
    };

    if (isImporting) {
        return (
            <div className="card animate-fade-in" style={{ padding: '2rem' }}>
                <h3>{t('importJson')}</h3>
                <p>{t('pasteJson')}</p>
                <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='[{"date": "14.01.26", "name": "Test", "amount": 10, "type": "Food"}]'
                    style={{
                        width: '100%',
                        height: '200px',
                        marginTop: '1rem',
                        padding: '0.5rem',
                        fontFamily: 'monospace',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)'
                    }}
                />
                <div className="actions" style={{ marginTop: '1rem', justifyContent: 'flex-end' }}>
                    <button className="secondary" onClick={() => setIsImporting(false)}>
                        {t('cancel')}
                    </button>
                    <button className="primary" onClick={handleSave}>
                        {t('saveImport')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
            <h3>{t('noDataFound')}</h3>
            <p>{t('noDataDesc')}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                <button onClick={() => setIsImporting(true)} className="secondary">
                    {t('importJson')}
                </button>
            </div>
        </div>
    );
};


export default DataRetrieval;
