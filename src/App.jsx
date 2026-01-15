import React, { useState, useEffect, useMemo } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ErrorLogWindow from './components/ErrorLogWindow';
import DataRetrieval from './components/DataRetrieval';
import Notification from './components/Notification';
import Dashboard from './components/Dashboard';
import ConfirmModal from './components/ConfirmModal';
import { db, auth } from './services/firebase';
import { buildTransactionPayload } from './services/requestBuilder';
import { saveTransactions, fetchTransactions, fetchPublicTransactions } from './services/dbService';
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
  const [isSharedView, setIsSharedView] = useState(false);
  const [sharedUid, setSharedUid] = useState(null);

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

    // Check for share parameter
    const params = new URLSearchParams(window.location.search);
    const shareUid = params.get('share');
    if (shareUid) {
      setIsSharedView(true);
      setSharedUid(shareUid);
      setActiveView('dashboard');
      loadSharedData(shareUid);
    } else {
      // Initial Data Load
      loadData();
    }
  }, []);

  const loadSharedData = async (uid) => {
    setLoading(true);
    try {
      const data = await fetchPublicTransactions(uid);
      if (data) {
        const { validTransactions, errors: validationErrors } = validateAndMap(data);
        setTransactions(validTransactions);
        setErrors(validationErrors);
      }
    } catch (error) {
      console.error("Failed to load shared data:", error);
      setNotification({ message: 'Failed to load shared dashboard. It might be private or deleted.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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

  const handleShareDashboard = () => {
    const user = auth.currentUser;
    if (!user) {
      setNotification({ message: 'Please save to cloud first to get a shareable link.', type: 'error' });
      return;
    }
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${user.uid}`;
    navigator.clipboard.writeText(shareUrl);
    setNotification({ message: 'Share link copied to clipboard! Anyone with this link can view your dashboard.', type: 'success' });
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

      {isSharedView && (
        <div className="share-banner">
          <span>Viewing Shared Dashboard</span>
          <button className="secondary small" onClick={() => window.location.href = window.location.pathname}>
            Go to My Dashboard
          </button>
        </div>
      )}

      {!isSharedView && (
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
      )}

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
                  <DataRetrieval onImport={handleImportJson} />
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
        <div className="dashboard-view-container">
          {!isSharedView && transactions.length > 0 && (
            <div className="dashboard-actions">
              <button className="secondary share-btn" onClick={handleShareDashboard}>
                🔗 Share Dashboard
              </button>
            </div>
          )}
          <Dashboard transactions={transactions} />
        </div>
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
