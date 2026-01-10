import React from 'react';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
    if (transactions.length === 0) {
        return (
            <div className="card animate-fade-in" style={{ textAlign: 'center', color: '#94a3b8' }}>
                <p>No transactions added yet.</p>
            </div>
        );
    }

    return (
        <div className="card animate-fade-in">
            <h2>Transactions ({transactions.length})</h2>
            <ul className="transaction-list">
                {transactions.map((transaction) => (
                    <li key={transaction.id} className="transaction-item">
                        <div className="transaction-details">
                            <div className="transaction-name">{transaction.name}</div>
                            <div className="transaction-meta">
                                <span className="transaction-date">{transaction.date}</span>
                                <span className="transaction-type">{transaction.type}</span>
                            </div>
                        </div>
                        <div style={{ marginRight: '1rem', fontWeight: 'bold', color: '#3b82f6' }}>
                            {transaction.amount}
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
                ))}
            </ul>
        </div>
    );
};

export default TransactionList;
