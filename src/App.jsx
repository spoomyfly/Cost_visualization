import React, { useState } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [jsonOutput, setJsonOutput] = useState('');

  const normalizeType = (type) => {
    if (!type) return '';
    // Remove special signs (keep only letters and numbers) and uppercase
    // Using regex to match only alphanumeric characters from any language
    // \p{L} matches any unicode letter, \p{N} matches any unicode number
    return type
      .replace(/[^\p{L}\p{N}]/gu, '')
      .toUpperCase();
  };

  const handleSaveTransaction = (transactionData) => {
    if (editingId) {
      setTransactions(prev => prev.map(t =>
        t.id === editingId ? { ...transactionData, id: editingId } : t
      ));
      setEditingId(null);
    } else {
      setTransactions(prev => [
        ...prev,
        { ...transactionData, id: crypto.randomUUID() }
      ]);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  const generateJson = () => {
    const output = transactions.map(({ id, ...t }) => ({
      ...t,
      type: normalizeType(t.type)
    }));
    setJsonOutput(JSON.stringify(output, null, 2));
  };

  const editingTransaction = transactions.find(t => t.id === editingId);

  return (
    <div className="app-container">
      <h1>Cost Visualization</h1>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div>
          <TransactionForm
            onSave={handleSaveTransaction}
            editingTransaction={editingTransaction}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        <div>
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {transactions.length > 0 && (
            <div className="card animate-fade-in">
              <button onClick={generateJson} style={{ width: '100%', marginBottom: '1rem' }}>
                Generate JSON
              </button>

              {jsonOutput && (
                <div>
                  <h3>JSON Output</h3>
                  <pre className="json-output">
                    {jsonOutput}
                  </pre>
                  <button
                    className="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(jsonOutput);
                      alert('Copied to clipboard!');
                    }}
                    style={{ marginTop: '0.5rem', fontSize: '0.8em' }}
                  >
                    Copy to Clipboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
