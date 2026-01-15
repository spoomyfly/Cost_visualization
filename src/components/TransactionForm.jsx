import React, { useState, useEffect } from 'react';

const TransactionForm = ({ onSave, editingTransaction, onCancelEdit, existingTypes }) => {
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    amount: '',
    type: ''
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
        date: formatDateToInput(editingTransaction.date)
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        name: '',
        amount: '',
        type: ''
      });
    }
  }, [editingTransaction]);

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
      type: formData.type
    });

    if (!editingTransaction) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        name: '',
        amount: '',
        type: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card animate-fade-in">
      <h2>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
      <div className="form-group">
        <label htmlFor="date">Date</label>
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
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Лампочка"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="amount">Amount (zł)</label>
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
        <label htmlFor="type">Type</label>
        <input
          type="text"
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          placeholder="e.g., Общее"
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
            Cancel
          </button>
        )}
        <button type="submit">
          {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
