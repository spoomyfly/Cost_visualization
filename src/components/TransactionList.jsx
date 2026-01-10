import React, { useState } from 'react';

const TransactionList = ({ transactions, onEdit, onDelete, rates }) => {
    const [displayCurrency, setDisplayCurrency] = useState('');
    if (transactions.length === 0) {
        return (
            <div className="card animate-fade-in" style={{ textAlign: 'center', color: '#94a3b8' }}>
                <p>No transactions added yet.</p>
            </div>
        );
    }

    const totalSum = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const getConvertedAmount = (amountPLN) => {
        if (!displayCurrency || !rates || !rates[displayCurrency]) return null;
        const rate = rates[displayCurrency];
        return (amountPLN * rate).toFixed(2);
    };

    return (
        <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>Transactions ({transactions.length})</h2>
                {rates && (
                    <select
                        value={displayCurrency}
                        onChange={(e) => setDisplayCurrency(e.target.value)}
                        style={{ width: 'auto', padding: '0.4em' }}
                    >
                        <option value="">Convert to...</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="BYN">BYN (Br)</option>
                        <option value="RUB">RUB (₽)</option>
                    </select>
                )}
            </div>
            <ul className="transaction-list">
                {transactions.map((transaction) => {
                    const converted = getConvertedAmount(transaction.amount);
                    return (
                        <li key={transaction.id} className="transaction-item">
                            <div className="transaction-details">
                                <div className="transaction-name">{transaction.name}</div>
                                <div className="transaction-meta">
                                    <span className="transaction-date">{transaction.date}</span>
                                    <span className="transaction-type">{transaction.type}</span>
                                </div>
                            </div>
                            <div style={{ marginRight: '1rem', textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                                    {Number(transaction.amount).toFixed(2)} zł
                                </div>
                                {converted && (
                                    <div style={{ fontSize: '0.85em', color: '#94a3b8' }}>
                                        ≈ {converted} {displayCurrency}
                                    </div>
                                )}
                            </div>
                            <div className="actions">
                                <button className="secondary" onClick={() => onEdit(transaction)}>
                                    Edit
                                </button>
                                <button className="danger" onClick={() => onDelete(transaction.id)}>
                                    Delete
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1.2em',
                fontWeight: 'bold'
            }}>
                <span>Total Sum:</span>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#3b82f6' }}>{totalSum.toFixed(2)} zł</div>
                    {displayCurrency && rates && rates[displayCurrency] && (
                        <div style={{ fontSize: '0.8em', color: '#94a3b8' }}>
                            ≈ {(totalSum * rates[displayCurrency]).toFixed(2)} {displayCurrency}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionList;
