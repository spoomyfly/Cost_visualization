import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatToDisplayDate, formatToInputDate, parseDisplayDate } from '../utils/dateUtils';

const MEMORY_KEY = 'lastTransactionMemory';
const MEMORY_TTL_MS = 2 * 60 * 1000; // 2 minutes

const getRememberedEntry = () => {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return null;
    const memory = JSON.parse(raw);
    if (!memory || Date.now() - memory.timestamp > MEMORY_TTL_MS) return null;
    return memory;
  } catch {
    return null;
  }
};

const rememberEntry = (project, date) => {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify({ project, date, timestamp: Date.now() }));
  } catch {
    // Ignore storage errors (e.g. private browsing quota)
  }
};

const TransactionForm = ({ onSave, editingTransaction, onCancelEdit, existingTypes, existingProjects, defaultProject, rememberLastEntry }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    amount: '',
    type: '',
    project: ''
  });

  const buildBlankFormData = () => {
    const remembered = rememberLastEntry ? getRememberedEntry() : null;
    return {
      date: remembered?.date || new Date().toISOString().split('T')[0],
      name: '',
      amount: '',
      type: '',
      project: remembered?.project || defaultProject || 'Budget'
    };
  };

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        ...editingTransaction,
        date: formatToInputDate(parseDisplayDate(editingTransaction.date)),
        project: editingTransaction.project || 'Budget'
      });
    } else {
      setFormData(buildBlankFormData());
    }
    // buildBlankFormData is redefined each render but only reads props already in the deps array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTransaction, defaultProject, rememberLastEntry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    const project = formData.project || 'Budget';
    onSave({
      date: formatToDisplayDate(formData.date),
      name: formData.name,
      amount: isNaN(amount) ? 0 : parseFloat(amount.toFixed(2)),
      type: formData.type,
      project
    });

    if (!editingTransaction) {
      if (rememberLastEntry) {
        rememberEntry(project, formData.date);
      }
      setFormData(buildBlankFormData());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card animate-fade-in">
      <h2>{editingTransaction ? t('editTransaction') : t('addTransaction')}</h2>

      <div className="form-group">
        <label htmlFor="project">{t('project')}</label>
        <input
          type="text"
          id="project"
          name="project"
          value={formData.project}
          onChange={handleChange}
          placeholder={t('budget') || "Budget"}
          list="project-suggestions"
          required
        />
        <datalist id="project-suggestions">
          {existingProjects && existingProjects.map((proj, index) => (
            <option key={index} value={proj} />
          ))}
        </datalist>
      </div>

      <div className="form-group">
        <label htmlFor="date">{t('date')}</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="name">{t('name')}</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t('namePlaceholder') || "e.g., Apple"}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="amount">{t('amount')} (zł)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="type">{t('type')}</label>
        <input
          type="text"
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          placeholder={t('typePlaceholder') || "e.g., Food"}
          list="type-suggestions"
          required
        />
        <datalist id="type-suggestions">
          {existingTypes && existingTypes.map((type, index) => (
            <option key={index} value={type} />
          ))}
        </datalist>
      </div>
      <div className="actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
        {editingTransaction && (
          <button type="button" className="secondary" onClick={onCancelEdit}>
            {t('cancel')}
          </button>
        )}
        <button type="submit">
          {editingTransaction ? t('updateTransaction') : t('addTransaction')}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
