import React, { useState, useEffect, useMemo } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ErrorLogWindow from './components/ErrorLogWindow';
import DataRetrieval from './components/DataRetrieval';
import Notification from './components/Notification';
import Dashboard from './components/Dashboard';
import ConfirmModal from './components/ConfirmModal';
import { buildTransactionPayload } from './services/requestBuilder';
import { saveTransactions, fetchTransactions } from './services/dbService';
import { validateAndMap } from './services/dataRetrievalService';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [jsonOutput, setJsonOutput] = useState('');
  const [rates, setRates] = useState(null);
  const [errors, setErrors] = useState([]);
  const [showPullButton, setShowPullButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [activeView, setActiveView] = useState('transactions'); // 'transactions' or 'dashboard'
  const [deleteId, setDeleteId] = useState(null);

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

    // Initial Data Load
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions();
      if (data) {
        const { validTransactions, errors: validationErrors } = validateAndMap(data);
        setTransactions(validTransactions);
        setErrors(validationErrors);
        setShowPullButton(false);
      } else {
        setShowPullButton(true);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      // Optionally handle network errors here
    } finally {
      setLoading(false);
    }
  };

  const handleManualRetrieve = () => {
    // For now, this just retries the fetch, acting as the "Pull from Google Sheets" action
    // In a real scenario, this might trigger a specific cloud function or API call
    loadData();
  };

  const handleImportJson = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      const { validTransactions, errors: validationErrors } = validateAndMap(data);

      if (validTransactions.length > 0) {
        setTransactions(validTransactions);
        setErrors(validationErrors);
        setShowPullButton(false);
        setNotification({ message: `Successfully imported ${validTransactions.length} transactions!`, type: 'success' });
      } else {
        setNotification({ message: 'No valid transactions found in the provided JSON.', type: 'error' });
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        }
      }
    } catch (error) {
      setNotification({ message: 'Invalid JSON format. Please check your input.', type: 'error' });
    }
  };

  const uniqueTypes = useMemo(() => {
    const types = transactions.map(t => t.type).filter(Boolean);
    return [...new Set(types)].sort();
  }, [transactions]);


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
    setShowPullButton(false); // Hide button if user manually adds data
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    setTransactions(prev => {
      const newTransactions = prev.filter(t => t.id !== deleteId);
      if (newTransactions.length === 0) {
        setShowPullButton(true);
      }
      return newTransactions;
    });

    if (editingId === deleteId) {
      setEditingId(null);
    }

    setDeleteId(null);
    setNotification({ message: 'Transaction deleted successfully', type: 'success' });
  };

  const generateJson = () => {
    const output = buildTransactionPayload(transactions);
    setJsonOutput(JSON.stringify(output, null, 2));
  };

  const handleSaveToCloud = async () => {
    try {
      const payload = buildTransactionPayload(transactions);
      await saveTransactions(payload);
      setNotification({ message: 'Successfully saved to cloud!', type: 'success' });
    } catch (error) {
      setNotification({ message: error.message || 'Failed to save to cloud.', type: 'error' });
    }
  };

  const editingTransaction = transactions.find(t => t.id === editingId);

  return (
    <div className="app-container">
      <h1>Cost Visualization</h1>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {errors.length > 0 && (
        <ErrorLogWindow errors={errors} onClose={() => setErrors([])} />
      )}

      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeView === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveView('transactions')}
        >
          📝 Transactions
        </button>
        <button
          className={`nav-tab ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          📊 Dashboard
        </button>
      </div>

      {activeView === 'transactions' ? (
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div>
            <TransactionForm
              onSave={handleSaveTransaction}
              editingTransaction={editingTransaction}
              onCancelEdit={handleCancelEdit}
              existingTypes={uniqueTypes}
            />
          </div>

          <div>
            {loading ? (
              <div className="card animate-fade-in">Loading data...</div>
            ) : (
              <>
                {showPullButton && transactions.length === 0 ? (
                  <DataRetrieval onRetrieve={handleManualRetrieve} onImport={handleImportJson} />
                ) : (
                  <TransactionList
                    transactions={transactions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    rates={rates}
                  />
                )}

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
                            setNotification({ message: 'Copied to clipboard!', type: 'success' });
                          }}
                          style={{ marginTop: '0.5rem', fontSize: '0.8em' }}
                        >
                          Copy to Clipboard
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <Dashboard transactions={transactions} />
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Confirm Delete"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

export default App;
