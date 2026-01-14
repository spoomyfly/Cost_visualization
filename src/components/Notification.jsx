import React, { useEffect } from 'react';

const Notification = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className={`notification ${type} animate-fade-in`}>
            <div className="notification-content">
                {type === 'success' ? '✓' : '✕'} {message}
            </div>
            <button className="notification-close" onClick={onClose}>×</button>
        </div>
    );
};

export default Notification;
