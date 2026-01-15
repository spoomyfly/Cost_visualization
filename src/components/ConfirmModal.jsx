import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="secondary" onClick={onCancel}>
                        {cancelText || t('cancel')}
                    </button>
                    <button className="danger" onClick={onConfirm}>
                        {confirmText || t('confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
