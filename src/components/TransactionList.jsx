import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { filterTransactions, sortTransactions, calculateTotalSum } from '../utils/transactionUtils';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const TransactionList = ({ transactions, onEdit, onDelete, onTransfer, rates }) => {
    const { t } = useLanguage();
    const [displayCurrency, setDisplayCurrency] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [selectedIds, setSelectedIds] = useState([]);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination State
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredTransactions = useMemo(() => {
        return filterTransactions(transactions, { searchQuery, startDate, endDate });
    }, [transactions, searchQuery, startDate, endDate]);

    const sortedTransactions = useMemo(() => {
        return sortTransactions(filteredTransactions, sortConfig);
    }, [filteredTransactions, sortConfig]);

    const totalSum = calculateTotalSum(filteredTransactions);

    const getConvertedAmount = (amountPLN) => {
        if (!displayCurrency || !rates || !rates[displayCurrency]) return null;
        const rate = rates[displayCurrency];
        return (amountPLN * rate).toFixed(2);
    };

    const isFiltering = searchQuery || startDate || endDate;

    const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / pageSize));
    // Clamp instead of syncing via effect, so a shrinking result set (filter, delete, page size
    // change) never leaves the view on a page that no longer exists.
    const currentPageInRange = Math.min(currentPage, totalPages);

    const displayedTransactions = useMemo(() => {
        const start = (currentPageInRange - 1) * pageSize;
        return sortedTransactions.slice(start, start + pageSize);
    }, [sortedTransactions, currentPageInRange, pageSize]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(displayedTransactions.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (transactions.length === 0) {
        return (
            <div className="card animate-fade-in" style={{ textAlign: 'center', color: '#94a3b8' }}>
                <p>{t('noTransactions')}</p>
            </div>
        );
    }

    return (
        <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>{t('transactions')} ({filteredTransactions.length})</h2>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="filters-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder={t('search') || "Search..."}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            style={{ width: '120px', padding: '0.4em' }}
                        />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                            title={t('startDate')}
                            style={{ width: 'auto', padding: '0.4em' }}
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                            title={t('endDate')}
                            style={{ width: 'auto', padding: '0.4em' }}
                        />
                        {(searchQuery || startDate || endDate) && (
                            <button
                                className="secondary small"
                                onClick={() => {
                                    setSearchQuery('');
                                    setStartDate('');
                                    setEndDate('');
                                    setCurrentPage(1);
                                }}
                            >
                                {t('clearFilters') || "Clear"}
                            </button>
                        )}
                    </div>

                    <select
                        value={`${sortConfig.key}-${sortConfig.direction}`}
                        onChange={(e) => {
                            const [key, direction] = e.target.value.split('-');
                            setSortConfig({ key, direction });
                            setCurrentPage(1);
                        }}
                        style={{ width: 'auto', padding: '0.4em' }}
                    >
                        <option value="date-desc">{t('dateNewest')}</option>
                        <option value="date-asc">{t('dateOldest')}</option>
                        <option value="amount-desc">{t('amountHigh')}</option>
                        <option value="amount-asc">{t('amountLow')}</option>
                        <option value="type-asc">{t('typeAZ')}</option>
                        <option value="name-asc">{t('nameAZ')}</option>
                    </select>
                    {rates && (
                        <select
                            value={displayCurrency}
                            onChange={(e) => setDisplayCurrency(e.target.value)}
                            style={{ width: 'auto', padding: '0.4em' }}
                        >
                            <option value="">{t('convertTo')}</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                            <option value="UAH">UAH (₴)</option>
                            <option value="BYN">BYN (Br)</option>
                        </select>
                    )}
                </div>
            </div>

            {displayedTransactions.length > 0 && (
                <div className="transaction-selection-header">
                    <div className="transaction-checkbox-container">
                        <input
                            type="checkbox"
                            className="transaction-checkbox"
                            checked={selectedIds.length === displayedTransactions.length && displayedTransactions.length > 0}
                            onChange={handleSelectAll}
                            title={t('selectAll')}
                        />
                        <span style={{ marginLeft: '0.5rem' }}>{t('selectAll')}</span>
                    </div>
                    {selectedIds.length > 0 && (
                        <div className="transfer-actions">
                            <button
                                className="primary small"
                                onClick={() => onTransfer(selectedIds)}
                            >
                                📂 {t('transferSelected')} ({selectedIds.length})
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="transaction-scroll-container">
                <ul className="transaction-list">
                    {displayedTransactions.map((transaction) => {
                        const converted = getConvertedAmount(transaction.amount);
                        const isSelected = selectedIds.includes(transaction.id);
                        return (
                            <li key={transaction.id} className={`transaction-item ${isSelected ? 'selected' : ''}`}>
                                <div className="transaction-checkbox-container">
                                    <input
                                        type="checkbox"
                                        className="transaction-checkbox"
                                        checked={isSelected}
                                        onChange={() => handleSelectOne(transaction.id)}
                                    />
                                </div>
                                <div className="transaction-details">
                                    <div className="transaction-name">{transaction.name}</div>
                                    <div className="transaction-meta">
                                        <span className="transaction-date">{transaction.date}</span>
                                        <span className="transaction-type">{transaction.type}</span>
                                        {transaction.project && transaction.project !== 'Budget' && (
                                            <span className="transaction-project" style={{ marginLeft: '0.5rem', fontSize: '0.85em', opacity: 0.7 }}>
                                                📂 {transaction.project}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ marginRight: '1rem', textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                                        {Number(transaction.amount).toFixed(2)} zł
                                    </div>
                                    {converted && (
                                        <div style={{ fontSize: '0.85em', color: '#94a3b8' }}>
                                            ≈ {converted} {displayCurrency}
                                        </div>
                                    )}
                                </div>
                                <div className="actions">
                                    <button className="secondary" onClick={() => onEdit(transaction)}>
                                        {t('edit')}
                                    </button>
                                    <button className="danger" onClick={() => onDelete(transaction.id)}>
                                        {t('delete')}
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                    {displayedTransactions.length === 0 && isFiltering && (
                        <li className="transaction-item" style={{ justifyContent: 'center', color: '#94a3b8' }}>
                            {t('noResults') || "No results found"}
                        </li>
                    )}
                </ul>
            </div>

            {sortedTransactions.length > 0 && (
                <div className="pagination-container">
                    <div className="page-size-selector">
                        <span>{t('itemsPerPage')}:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        >
                            {PAGE_SIZE_OPTIONS.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="secondary small"
                            onClick={() => setCurrentPage(p => Math.max(1, Math.min(totalPages, p) - 1))}
                            disabled={currentPageInRange === 1}
                        >
                            ← {t('previous')}
                        </button>
                        <span className="pagination-info">
                            {t('page')} {currentPageInRange} / {totalPages}
                        </span>
                        <button
                            className="secondary small"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPageInRange === totalPages}
                        >
                            {t('next')} →
                        </button>
                    </div>
                </div>
            )}

            <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1.2em',
                fontWeight: 'bold'
            }}>
                <span>{t('totalSum')}</span>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#3b82f6' }}>{totalSum.toFixed(2)} zł</div>
                    {displayCurrency && rates && rates[displayCurrency] && (
                        <div style={{ fontSize: '0.8em', color: '#94a3b8' }}>
                            ≈ {(totalSum * rates[displayCurrency]).toFixed(2)} {displayCurrency}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionList;
