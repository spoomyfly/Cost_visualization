import React from 'react';

const ErrorLogWindow = ({ errors, onClose }) => {
    if (!errors || errors.length === 0) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content card animate-fade-in" style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, color: '#e74c3c' }}>Data Discrepancies</h2>
                    <button onClick={onClose} className="secondary" style={{ padding: '0.25rem 0.5rem' }}>X</button>
                </div>
                <p>The following issues were found in the retrieved data:</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {errors.map((err, i) => (
                        <li key={i} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#fff5f5' }}>
                            {err.message ? (
                                <strong>{err.message}</strong>
                            ) : (
                                <>
                                    <div><strong>Item Index:</strong> {err.index}</div>
                                    <div><strong>Issues:</strong> {err.messages.join(', ')}</div>
                                    <div style={{ fontSize: '0.85em', color: '#666', marginTop: '0.25rem' }}>
                                        Raw Data: {JSON.stringify(err.item)}
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
                <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};

export default ErrorLogWindow;
