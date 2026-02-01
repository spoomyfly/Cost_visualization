import React, { useState, useEffect, useMemo } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ErrorLogWindow from './components/ErrorLogWindow';
import DataRetrieval from './components/DataRetrieval';
import Notification from './components/Notification';
import Dashboard from './components/Dashboard';
import ConfirmModal from './components/ConfirmModal';
import InputModal from './components/InputModal';
import { db, auth } from './services/firebase';
import { buildTransactionPayload } from './services/requestBuilder';
import { saveTransactions, fetchTransactions, fetchPublicTransactions } from './services/dbService';
import { validateAndMap } from './services/dataRetrievalService';
import { useLanguage } from './i18n/LanguageContext';
import Auth from './components/Auth';
import { loginAnonymously } from './services/authService';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [jsonOutput, setJsonOutput] = useState('');
  const [isJsonExpanded, setIsJsonExpanded] = useState(false);
  const [rates, setRates] = useState(null);
  const [errors, setErrors] = useState([]);
  const [showPullButton, setShowPullButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [activeView, setActiveView] = useState('transactions'); // 'transactions' or 'dashboard'
  const [deleteId, setDeleteId] = useState(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [sharedUid, setSharedUid] = useState(null);
  const { language, setLanguage, t } = useLanguage();

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
      // Data will be loaded via onAuthChange in the Auth component
    }
  }, []);

  const [lastLoadedUid, setLastLoadedUid] = useState(null);

  const handleAuthChange = (user) => {
    if (user) {
      if (user.uid !== lastLoadedUid) {
        setLastLoadedUid(user.uid);
        loadData();
      }
    } else {
      // Trigger anonymous login if no user is found
      loginAnonymously();
    }
  };

  const [selectedProject, setSelectedProject] = useState('All');
  const [manualProjects, setManualProjects] = useState([]);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);

  const uniqueProjects = useMemo(() => {
    const projects = transactions.map(t => t.project).filter(Boolean);
    return ['All', ...new Set([...projects, ...manualProjects])].sort();
  }, [transactions, manualProjects]);

  const handleAddProject = () => {
    setIsInputModalOpen(true);
  };

  const handleConfirmAddProject = (name) => {
    if (name && !uniqueProjects.includes(name)) {
      setManualProjects(prev => [...prev, name]);
      setSelectedProject(name);
      setNotification({ message: `${t('addProject')}: ${name}`, type: 'success' });
    } else if (uniqueProjects.includes(name)) {
      setNotification({ message: t('duplicateProject') || "Project already exists", type: 'error' });
    }
    setIsInputModalOpen(false);
  };

  const filteredTransactions = useMemo(() => {
    if (selectedProject === 'All') return transactions;
    return transactions.filter(t => t.project === selectedProject);
  }, [transactions, selectedProject]);

  useEffect(() => {
    document.title = selectedProject === 'All' ? t('appTitle') : `${selectedProject} - ${t('appTitle')}`;
  }, [selectedProject, t]);


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
      setNotification({ message: t('sharedLoadError'), type: 'error' });
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
      const defaultProj = selectedProject === 'All' ? 'Budget' : selectedProject;
      const { validTransactions, errors: validationErrors } = validateAndMap(data, defaultProj);

      if (validTransactions.length > 0) {
        setTransactions(validTransactions);
        setErrors(validationErrors);
        setShowPullButton(false);
        setNotification({ message: t('importSuccess', { count: validTransactions.length }), type: 'success' });
      } else {
        setNotification({ message: t('importNoValid'), type: 'error' });
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        }
      }
    } catch (error) {
      setNotification({ message: t('importInvalidJson'), type: 'error' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setNotification({ message: t('deleteSuccess') || 'Transaction deleted successfully', type: 'success' });
  };

  const generateJson = () => {
    const output = buildTransactionPayload(transactions);
    setJsonOutput(JSON.stringify(output, null, 2));
    setIsJsonExpanded(false); // Default to minimized when newly generated
  };

  const handleSaveToCloud = async () => {
    try {
      const payload = buildTransactionPayload(transactions);
      await saveTransactions(payload);
      setNotification({ message: t('saveSuccess'), type: 'success' });
    } catch (error) {
      setNotification({ message: error.message || t('saveError'), type: 'error' });
    }
  };

  const handleShareDashboard = () => {
    const user = auth.currentUser;
    if (!user) {
      setNotification({ message: t('shareError'), type: 'error' });
      return;
    }
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${user.uid}`;
    navigator.clipboard.writeText(shareUrl);
    setNotification({ message: t('shareSuccess'), type: 'success' });
  };

  const editingTransaction = transactions.find(t => t.id === editingId);

  return (
    <div className="app-container">
      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="project-switcher"
            style={{ marginRight: '0.5rem' }}
          >
            {uniqueProjects.map(p => (
              <option key={p} value={p}>
                {p === 'All' ? t('allProjects') : p}
              </option>
            ))}
          </select>
          <button className="secondary small" onClick={handleAddProject} title={t('addProject') || "Add Project"}>
            +
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Auth onAuthChange={handleAuthChange} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-switcher"
          >
            <option value="pl">Polski</option>
            <option value="en">English</option>
            <option value="uk">Українська</option>
            <option value="ru">Русский</option>
          </select>
        </div>
      </div>
      <h1>{selectedProject === 'All' ? t('appTitle') : selectedProject}</h1>

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
          <span>{t('sharedBanner')}</span>
          <button className="secondary small" onClick={() => {
            window.location.href = window.location.origin + window.location.pathname;
          }}>
            {t('goToMyDashboard')}
          </button>
        </div>
      )}

      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeView === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveView('transactions')}
        >
          {t('navTransactions')}
        </button>
        <button
          className={`nav-tab ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          {t('navDashboard')}
        </button>
      </div>

      {activeView === 'transactions' ? (
        <div className="dashboard-grid">
          {!isSharedView && (
            <div className="transaction-form-container">
              <TransactionForm
                onSave={handleSaveTransaction}
                editingTransaction={editingTransaction}
                onCancel={handleCancelEdit}
                existingTypes={uniqueTypes}
                existingProjects={uniqueProjects.filter(p => p !== 'All')}
                defaultProject={selectedProject === 'All' ? 'Budget' : selectedProject}
              />
            </div>
          )}

          <div className="transaction-list-container">
            {loading ? (
              <div className="card animate-fade-in">{t('loading')}</div>
            ) : (
              <>
                {filteredTransactions.length === 0 && !isSharedView ? (
                  <DataRetrieval onImport={handleImportJson} />
                ) : (
                  <TransactionList
                    transactions={filteredTransactions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    rates={rates}
                  />
                )}

                {transactions.length > 0 && !isSharedView && (
                  <div className="card animate-fade-in">
                    <button onClick={generateJson} style={{ width: '100%', marginBottom: '1rem' }}>
                      {t('generateJson')}
                    </button>
                    <button onClick={handleSaveToCloud} style={{ width: '100%', marginBottom: '1rem' }} className="primary">
                      {t('saveToCloud')}
                    </button>

                    {jsonOutput && (
                      <div className="json-output-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h3 style={{ margin: 0 }}>{t('jsonOutput')}</h3>
                          <button
                            className="secondary small"
                            onClick={() => setIsJsonExpanded(!isJsonExpanded)}
                          >
                            {isJsonExpanded ? t('showLess') : t('showAll')}
                          </button>
                        </div>
                        <pre className={`json-output ${isJsonExpanded ? 'expanded' : 'minimized'}`}>
                          {jsonOutput}
                        </pre>
                        <button
                          className="secondary"
                          onClick={() => {
                            navigator.clipboard.writeText(jsonOutput);
                            setNotification({ message: t('copied'), type: 'success' });
                          }}
                          style={{ marginTop: '0.5rem', fontSize: '0.8em', width: '100%' }}
                        >
                          {t('copyToClipboard')}
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
                {t('shareDashboard')}
              </button>
            </div>
          )}
          <Dashboard
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedProject={selectedProject}
            onImport={handleImportJson}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMsg')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <InputModal
        isOpen={isInputModalOpen}
        title={t('addProject')}
        message={t('enterProjectName')}
        onConfirm={handleConfirmAddProject}
        onCancel={() => setIsInputModalOpen(false)}
        confirmText={t('add') || 'Add'}
        placeholder={t('projectName') || 'Project Name'}
      />
    </div>
  );
}

export default App;
