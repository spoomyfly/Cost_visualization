import React, { useState } from 'react';

const DataRetrieval = ({ onRetrieve, onImport }) => {
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
                <h3>Import JSON</h3>
                <p>Paste your transaction JSON below:</p>
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
                        Cancel
                    </button>
                    <button className="primary" onClick={handleSave}>
                        Save & Import
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
            <h3>No Data Found</h3>
            <p>Your transaction list is empty. You can pull data from the cloud source or import from JSON.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                <button onClick={onRetrieve} className="primary">
                    Pull from Google Sheets
                </button>
                <button onClick={() => setIsImporting(true)} className="secondary">
                    Import JSON
                </button>
            </div>
        </div>
    );
};


export default DataRetrieval;
