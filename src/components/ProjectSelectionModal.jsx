import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const ProjectSelectionModal = ({ isOpen, title, message, projects, onConfirm, onCancel, confirmText }) => {
    const { t } = useLanguage();
    const [selectedProject, setSelectedProject] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (selectedProject) {
            onConfirm(selectedProject);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-card" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
                <h2 style={{ marginBottom: '0.5rem' }}>{title}</h2>
                {message && <p style={{ marginBottom: '1.5rem', fontSize: '0.9em' }}>{message}</p>}

                <div className="project-list-container" style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginBottom: '2rem',
                    padding: '0.5rem',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)'
                }}>
                    {projects.map(p => (
                        <div
                            key={p}
                            className={`project-item ${selectedProject === p ? 'active' : ''}`}
                            onClick={() => setSelectedProject(p)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.8rem 1rem',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: selectedProject === p ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid',
                                borderColor: selectedProject === p ? 'var(--primary-color)' : 'var(--glass-border)',
                                color: selectedProject === p ? 'white' : 'var(--text-color)',
                                textAlign: 'left'
                            }}
                        >
                            <span style={{ fontSize: '1.2em' }}>📂</span>
                            <span style={{ fontWeight: '500' }}>{p}</span>
                            {selectedProject === p && (
                                <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>✓</span>
                            )}
                        </div>
                    ))}
                    {projects.length === 0 && (
                        <div style={{ padding: '2rem', color: '#94a3b8', fontSize: '0.9em' }}>
                            {t('noProjectsAvailable') || 'No target projects available'}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="secondary" onClick={onCancel}>
                        {t('cancel')}
                    </button>
                    <button className="primary" onClick={handleConfirm} disabled={!selectedProject}>
                        {confirmText || t('confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectSelectionModal;
