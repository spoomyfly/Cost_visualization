import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const TransactionList = ({ transactions, onEdit, onDelete, rates }) => {
    const { t } = useLanguage();
    const [displayCurrency, setDisplayCurrency] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const THRESHOLD = 10;

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        let result = transactions;

        // Date Filter
        if (startDate || endDate) {
            result = result.filter(t => {
                if (!t.date) return false;
                const [day, month, year] = t.date.split('.').map(Number);
                const tDate = new Date(2000 + year, month - 1, day).getTime();

                let startOk = true;
                let endOk = true;
                if (startDate) {
                    const [sY, sM, sD] = startDate.split('-').map(Number);
                    const startTs = new Date(sY, sM - 1, sD).getTime();
                    startOk = tDate >= startTs;
                }
                if (endDate) {
                    const [eY, eM, eD] = endDate.split('-').map(Number);
                    const endTs = new Date(eY, eM - 1, eD).getTime();
                    endOk = tDate <= endTs;
                }
                return startOk && endOk;
            });
        }

        // Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(t =>
                (t.name && t.name.toLowerCase().includes(lowerQuery)) ||
                (t.type && t.type.toLowerCase().includes(lowerQuery))
            );
        }
        return result;
    }, [transactions, searchQuery, startDate, endDate]);

    const sortedTransactions = useMemo(() => {
        const sortable = [...filteredTransactions];
        sortable.sort((a, b) => {
            if (sortConfig.key === 'amount') {
                const valA = parseFloat(a.amount) || 0;
                const valB = parseFloat(b.amount) || 0;
                return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
            }
            if (sortConfig.key === 'date') {
                const parseDate = (d) => {
                    if (!d) return 0;
                    const [day, month, year] = d.split('.').map(Number);
                    return new Date(2000 + year, month - 1, day).getTime();
                };
                const valA = parseDate(a.date);
                const valB = parseDate(b.date);
                return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
            }
            if (sortConfig.key === 'type' || sortConfig.key === 'name') {
                const valA = (a[sortConfig.key] || '').toLowerCase();
                const valB = (b[sortConfig.key] || '').toLowerCase();
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            }
            return 0;
        });
        return sortable;
    }, [filteredTransactions, sortConfig]);

    if (transactions.length === 0) {
        return (
            <div className="card animate-fade-in" style={{ textAlign: 'center', color: '#94a3b8' }}>
                <p>{t('noTransactions')}</p>
            </div>
        );
    }

    const totalSum = filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const getConvertedAmount = (amountPLN) => {
        if (!displayCurrency || !rates || !rates[displayCurrency]) return null;
        const rate = rates[displayCurrency];
        return (amountPLN * rate).toFixed(2);
    };

    // If filtering, show all results. Else paginate/threshold.
    const isFiltering = searchQuery || startDate || endDate;
    const displayedTransactions = (isFiltering || isExpanded) ? sortedTransactions : sortedTransactions.slice(0, THRESHOLD);

    return (
        <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>{t('transactions')} ({filteredTransactions.length})</h2>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Filters */}
                    <div className="filters-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder={t('search') || "Search..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '120px', padding: '0.4em' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            {/* <label htmlFor="startDate" style={{fontSize: '0.8em'}}>{t('startDate')}</label> */}
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                title={t('startDate')}
                                style={{ width: 'auto', padding: '0.4em' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            {/* <label htmlFor="endDate" style={{fontSize: '0.8em'}}>{t('endDate')}</label> */}
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                title={t('endDate')}
                                style={{ width: 'auto', padding: '0.4em' }}
                            />
                        </div>
                        {(searchQuery || startDate || endDate) && (
                            <button
                                className="secondary small"
                                onClick={() => {
                                    setSearchQuery('');
                                    setStartDate('');
                                    setEndDate('');
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

            <div
                className="transaction-scroll-container"
            >
                <ul className="transaction-list">
                    {displayedTransactions.map((transaction) => {
                        const converted = getConvertedAmount(transaction.amount);
                        return (
                            <li key={transaction.id} className="transaction-item">
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

            {!isFiltering && transactions.length > THRESHOLD && (
                <button
                    className="secondary"
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{ width: '100%', marginTop: '1rem' }}
                >
                    {isExpanded ? t('showLess') : `${t('showAll')} (${transactions.length})`}
                </button>
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
