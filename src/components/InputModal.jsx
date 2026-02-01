import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const InputModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, initialValue = '', placeholder = '' }) => {
    const { t } = useLanguage();
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
            // Focus input after a short delay to ensure modal is rendered
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleConfirm();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                {message && <p>{message}</p>}

                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={handleKeyDown}
                    style={{
                        width: '100%',
                        padding: '0.8rem',
                        fontSize: '1rem',
                        marginBottom: '1.5rem',
                        marginTop: '1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        outline: 'none'
                    }}
                />

                <div className="modal-actions">
                    <button className="secondary" onClick={onCancel}>
                        {cancelText || t('cancel')}
                    </button>
                    <button className="primary" onClick={handleConfirm} disabled={!value.trim()}>
                        {confirmText || t('confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputModal;
