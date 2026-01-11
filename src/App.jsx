import React, { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import { buildTransactionPayload } from './services/requestBuilder';
import { saveTransactions } from './services/dbService';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [jsonOutput, setJsonOutput] = useState('');
  const [rates, setRates] = useState(null);

  useEffect(() => {
    // Fetch rates for PLN base
    fetch('https://open.er-api.com/v6/latest/PLN')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setRates(data.rates);
        }
      })
      .catch(err => console.error("Failed to fetch rates:", err));
  }, []);



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
    const output = buildTransactionPayload(transactions);
    setJsonOutput(JSON.stringify(output, null, 2));
  };

  const handleSaveToCloud = async () => {
    try {
      const payload = buildTransactionPayload(transactions);
      await saveTransactions(payload);
      alert('Successfully saved to cloud!');
    } catch (error) {
      alert(error.message || 'Failed to save to cloud.');
    }
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
            rates={rates}
          />

          {transactions.length > 0 && (
            <div className="card animate-fade-in">
              <button onClick={generateJson} style={{ width: '100%', marginBottom: '1rem' }}>
                Generate JSON
              </button>
              <button onClick={handleSaveToCloud} style={{ width: '100%', marginBottom: '1rem' }} className="primary">
                Save to Cloud (Firebase)
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
