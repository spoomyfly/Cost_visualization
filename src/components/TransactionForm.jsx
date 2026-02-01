import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const TransactionForm = ({ onSave, editingTransaction, onCancelEdit, existingTypes, existingProjects, defaultProject }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    amount: '',
    type: '',
    project: ''
  });

  // Helper to format Date object to DD.MM.YY
  const formatDateToDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  };

  // Helper to format DD.MM.YY to YYYY-MM-DD for input[type="date"]
  const formatDateToInput = (displayDate) => {
    if (!displayDate) return new Date().toISOString().split('T')[0];
    const parts = displayDate.split('.');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `20${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        ...editingTransaction,
        date: formatDateToInput(editingTransaction.date),
        project: editingTransaction.project || 'Budget'
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        name: '',
        amount: '',
        type: '',
        project: defaultProject || 'Budget'
      });
    }
  }, [editingTransaction, defaultProject]);

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
    onSave({
      date: formatDateToDisplay(formData.date),
      name: formData.name,
      amount: isNaN(amount) ? 0 : parseFloat(amount.toFixed(2)),
      type: formData.type,
      project: formData.project || 'Budget'
    });

    if (!editingTransaction) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        name: '',
        amount: '',
        type: '',
        project: defaultProject || 'Budget'
      });
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
