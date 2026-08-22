import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const SettingsPanel = ({ isOpen, settings, onToggle, onClose }) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card settings-panel" onClick={(e) => e.stopPropagation()}>
                <h2>{t('settings')}</h2>

                <div className="settings-option">
                    <label className="settings-option-toggle">
                        <input
                            type="checkbox"
                            className="transaction-checkbox"
                            checked={!!settings.rememberLastEntry}
                            onChange={(e) => onToggle('rememberLastEntry', e.target.checked)}
                        />
                        <span className="settings-option-title">{t('rememberLastEntry')}</span>
                    </label>
                    <p className="settings-option-desc">{t('rememberLastEntryDesc')}</p>
                </div>

                <div className="modal-actions">
                    <button className="primary" onClick={onClose}>
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
