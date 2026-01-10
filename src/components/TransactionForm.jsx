import React, { useState, useEffect } from 'react';

const TransactionForm = ({ onSave, editingTransaction, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    amount: '',
    type: ''
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData(editingTransaction);
    } else {
      setFormData({
        date: new Date().toLocaleDateString('ru-RU'), // Default to today, formatted roughly
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
    onSave({
      ...formData,
      amount: parseFloat(formData.amount) || 0
    });
    // Reset form if not editing (or handled by parent)
    if (!editingTransaction) {
      setFormData({
        date: '',
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
        <label htmlFor="date">Date (e.g., 06.12.25)</label>
        <input
          type="text"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          placeholder="DD.MM.YY"
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
        <label htmlFor="amount">Amount</label>
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
          required
        />
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
