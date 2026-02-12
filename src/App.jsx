import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ErrorLogWindow from './components/ErrorLogWindow';
import DataRetrieval from './components/DataRetrieval';
import Notification from './components/Notification';
import Dashboard from './components/Dashboard';
import ConfirmModal from './components/ConfirmModal';
import InputModal from './components/InputModal';
import { auth } from './services/firebase';
import { filterTransactions, getUniqueValues } from './utils/transactionUtils';
import { useLanguage } from './i18n/LanguageContext';
import Auth from './components/Auth';
import { loginAnonymously } from './services/authService';
import { useTransactions } from './hooks/useTransactions';
import { useRates } from './hooks/useRates';
import { useProjects } from './hooks/useProjects';

function App() {
  const { language, setLanguage, t } = useLanguage();
  const [notification, setNotification] = useState(null);
  const [activeView, setActiveView] = useState('transactions'); // 'transactions' or 'dashboard'
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [jsonOutput, setJsonOutput] = useState('');
  const [isJsonExpanded, setIsJsonExpanded] = useState(false);
  const [lastLoadedUid, setLastLoadedUid] = useState(null);

  const { rates } = useRates();
  const {
    transactions,
    loading,
    errors,
    setErrors,
    showPullButton,
    loadData,
    loadSharedData,
    saveTransaction,
    deleteTransaction,
    saveToCloud,
    importJson
  } = useTransactions(setNotification, t);

  const {
    selectedProject,
    setSelectedProject,
    uniqueProjects,
    isInputModalOpen,
    setIsInputModalOpen,
    handleAddProject,
    confirmAddProject
  } = useProjects(transactions, t, setNotification);

  useEffect(() => {
    // Check for share parameter on mount
    const params = new URLSearchParams(window.location.search);
    const shareUid = params.get('share');
    if (shareUid) {
      setIsSharedView(true);
      setActiveView('dashboard');
      loadSharedData(shareUid);
    }
  }, [loadSharedData]);

  const handleAuthChange = useCallback((user) => {
    if (user) {
      if (user.uid !== lastLoadedUid) {
        setLastLoadedUid(user.uid);
        loadData();
      }
    } else {
      setLastLoadedUid(null);
      loginAnonymously();
    }
  }, [lastLoadedUid, loadData]);

  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, { project: selectedProject });
  }, [transactions, selectedProject]);

  const uniqueTypes = useMemo(() => {
    return getUniqueValues(transactions, 'type');
  }, [transactions]);

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteTransaction(deleteId);
    if (editingId === deleteId) setEditingId(null);
    setDeleteId(null);
    setNotification({ message: t('deleteSuccess') || 'Transaction deleted successfully', type: 'success' });
  };

  const generateJson = () => {
    const { buildTransactionPayload } = import.meta.glob('./services/requestBuilder', { eager: true })['./services/requestBuilder'];
    const output = buildTransactionPayload(transactions);
    setJsonOutput(JSON.stringify(output, null, 2));
    setIsJsonExpanded(false);
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
          <button className="secondary small" onClick={() => window.location.href = window.location.origin + window.location.pathname}>
            {t('goToMyDashboard')}
          </button>
        </div>
      )}

      <div className="nav-tabs">
        <button className={`nav-tab ${activeView === 'transactions' ? 'active' : ''}`} onClick={() => setActiveView('transactions')}>
          {t('navTransactions')}
        </button>
        <button className={`nav-tab ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
          {t('navDashboard')}
        </button>
      </div>

      {activeView === 'transactions' ? (
        <div className="dashboard-grid">
          {!isSharedView && (
            <div className="transaction-form-container">
              <TransactionForm
                onSave={(data) => {
                  saveTransaction(data, editingId);
                  if (editingId) setEditingId(null);
                }}
                editingTransaction={editingTransaction}
                onCancelEdit={() => setEditingId(null)}
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
                  <DataRetrieval onImport={(json) => importJson(json, selectedProject)} />
                ) : (
                  <TransactionList
                    transactions={filteredTransactions}
                    onEdit={handleEdit}
                    onDelete={setDeleteId}
                    rates={rates}
                  />
                )}

                {transactions.length > 0 && !isSharedView && (
                  <div className="card animate-fade-in">
                    <button onClick={generateJson} style={{ width: '100%', marginBottom: '1rem' }}>
                      {t('generateJson')}
                    </button>
                    <button onClick={() => saveToCloud()} style={{ width: '100%', marginBottom: '1rem' }} className="primary">
                      {t('saveToCloud')}
                    </button>

                    {jsonOutput && (
                      <div className="json-output-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h3 style={{ margin: 0 }}>{t('jsonOutput')}</h3>
                          <button className="secondary small" onClick={() => setIsJsonExpanded(!isJsonExpanded)}>
                            {isJsonExpanded ? t('showLess') : t('showAll')}
                          </button>
                        </div>
                        <pre className={`json-output ${isJsonExpanded ? 'expanded' : 'minimized'}`}>{jsonOutput}</pre>
                        <button className="secondary" onClick={() => {
                          navigator.clipboard.writeText(jsonOutput);
                          setNotification({ message: t('copied'), type: 'success' });
                        }} style={{ marginTop: '0.5rem', fontSize: '0.8em', width: '100%' }}>
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
            onDelete={setDeleteId}
            selectedProject={selectedProject}
            onImport={(json) => importJson(json, selectedProject)}
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
        onConfirm={confirmAddProject}
        onCancel={() => setIsInputModalOpen(false)}
        confirmText={t('add') || 'Add'}
        placeholder={t('projectName') || 'Project Name'}
      />
    </div>
  );
}

export default App;
