import React from 'react';

const DataRetrieval = ({ onRetrieve }) => {
    return (
        <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
            <h3>No Data Found</h3>
            <p>Your transaction list is empty. You can pull data from the cloud source.</p>
            <button onClick={onRetrieve} className="primary" style={{ marginTop: '1rem' }}>
                Pull from Google Sheets
            </button>
        </div>
    );
};

export default DataRetrieval;
