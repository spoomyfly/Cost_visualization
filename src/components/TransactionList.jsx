import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const TransactionList = ({ transactions, onEdit, onDelete, rates }) => {
    const { t } = useLanguage();
    const [displayCurrency, setDisplayCurrency] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);

    const THRESHOLD = 10;

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        if (!searchQuery) return transactions;
        const lowerQuery = searchQuery.toLowerCase();
        return transactions.filter(t =>
            (t.name && t.name.toLowerCase().includes(lowerQuery)) ||
            (t.type && t.type.toLowerCase().includes(lowerQuery))
        );
    }, [transactions, searchQuery]);

    const searchMatchCount = filteredTransactions.length;

    // Auto-show if only 1 match
    React.useEffect(() => {
        if (searchQuery && searchMatchCount === 1) {
            setShowSearchResults(true);
        } else if (!searchQuery) {
            setShowSearchResults(false);
        }
    }, [searchQuery, searchMatchCount]);

    const sortedTransactions = useMemo(() => {
        // If searching and showing results, use filtered list. Otherwise use full list (unless searching but not showing yet?)
        // Requirement: "Find by chars, if more than 2 option found, show how many options found. And make option to go to searched options."
        // This implies we show the FULL list until the user decides to view the search results (or if there's only 1 match).

        const sourceList = showSearchResults ? filteredTransactions : transactions;

        const sortable = [...sourceList];
        sortable.sort((a, b) => {
            if (sortConfig.key === 'amount') {
                const valA = parseFloat(a.amount) || 0;
                const valB = parseFloat(b.amount) || 0;
                return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
            }
            if (sortConfig.key === 'date') {
                const parseDate = (d) => {
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
    }, [transactions, filteredTransactions, showSearchResults, sortConfig]);

    if (transactions.length === 0) {
        return (
            <div className="card animate-fade-in" style={{ textAlign: 'center', color: '#94a3b8' }}>
                <p>{t('noTransactions')}</p>
            </div>
        );
    }

    const totalSum = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const getConvertedAmount = (amountPLN) => {
        if (!displayCurrency || !rates || !rates[displayCurrency]) return null;
        const rate = rates[displayCurrency];
        return (amountPLN * rate).toFixed(2);
    };

    // If showing search results, we might want to show all of them, or still paginate?
    // Let's assume show all for search results, but keep threshold for default view if not expanded.
    const displayedTransactions = (showSearchResults || isExpanded) ? sortedTransactions : sortedTransactions.slice(0, THRESHOLD);

    return (
        <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>{t('transactions')} ({transactions.length})</h2>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Search Input */}
                    <div className="search-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder={t('search') || "Search..."}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                // If user clears search, go back to full list
                                if (e.target.value === '') setShowSearchResults(false);
                                // If user types, we wait for them to click "Show" unless it's 1 match (handled by effect)
                                if (showSearchResults && e.target.value !== '') setShowSearchResults(false);
                            }}
                            style={{ width: '150px', padding: '0.4em' }}
                        />
                        {searchQuery && !showSearchResults && searchMatchCount > 1 && (
                            <button
                                className="secondary small"
                                onClick={() => setShowSearchResults(true)}
                            >
                                {t('showResults') || "Show"} ({searchMatchCount})
                            </button>
                        )}
                        {searchQuery && !showSearchResults && searchMatchCount === 0 && (
                            <span style={{ fontSize: '0.8em', color: '#94a3b8' }}>0 {t('found') || "found"}</span>
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
                    {displayedTransactions.length === 0 && showSearchResults && (
                        <li className="transaction-item" style={{ justifyContent: 'center', color: '#94a3b8' }}>
                            {t('noResults') || "No results found"}
                        </li>
                    )}
                </ul>
            </div>

            {!showSearchResults && transactions.length > THRESHOLD && (
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
