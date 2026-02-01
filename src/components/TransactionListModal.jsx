import React from 'react';
import TransactionList from './TransactionList';
import { useLanguage } from '../i18n/LanguageContext';

const TransactionListModal = ({ isOpen, title, transactions, onClose, onEdit, onDelete }) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '90%',
                    maxWidth: '800px',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>{title}</h2>
                    <button
                        className="secondary small"
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white' }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <TransactionList
                        transactions={transactions}
                        onEdit={(t) => { onEdit(t); onClose(); }}
                        onDelete={(id) => { onDelete(id); onClose(); }}
                        rates={null} // Optional: Pass rates if available contextually? For now simpler is fine.
                    />
                </div>
            </div>
        </div>
    );
};

export default TransactionListModal;
