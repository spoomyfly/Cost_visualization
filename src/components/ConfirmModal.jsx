import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="secondary" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="danger" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
