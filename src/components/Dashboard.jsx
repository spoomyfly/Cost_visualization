import React, { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import TransactionListModal from './TransactionListModal';
import PieChart from './PieChart';
import CumulativeChart from './CumulativeChart';
import DataRetrieval from './DataRetrieval';

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

const Dashboard = ({ transactions, onEdit, onDelete, selectedProject, onImport }) => {
    const { t } = useLanguage();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        transactions: []
    });

    const isAllProjects = selectedProject === 'All';

    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];
        let result = transactions;
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
        return result;
    }, [transactions, startDate, endDate]);

    const stats = useMemo(() => {
        // If no data matches filter, return empty stats but safe structure
        if (filteredTransactions.length === 0) {
            return {
                totalSpent: 0,
                avgCheck: 0,
                totalCount: 0,
                sortedGroups: [],
                sortedDaily: [],
                topExpenses: [],
                cumulativeData: []
            };
        }

        const totalSpent = filteredTransactions.reduce((sum, item) => sum + item.amount, 0);
        const avgCheck = filteredTransactions.length > 0 ? totalSpent / filteredTransactions.length : 0;

        // Grouping stats (by Type or by Project)
        const groupMap = {};
        filteredTransactions.forEach(item => {
            const groupKey = isAllProjects ? (item.project || t('budget')) : item.type;
            if (!groupMap[groupKey]) {
                groupMap[groupKey] = { total: 0, count: 0, items: [] };
            }
            groupMap[groupKey].total += item.amount;
            groupMap[groupKey].count += 1;
            groupMap[groupKey].items.push(item);
        });

        const sortedGroups = Object.entries(groupMap)
            .map(([name, data]) => ({
                name,
                value: data.total,
                count: data.count,
                items: data.items
            }))
            .sort((a, b) => b.value - a.value);

        // Daily stats
        const dailyMap = {};
        filteredTransactions.forEach(item => {
            if (!dailyMap[item.date]) {
                dailyMap[item.date] = { total: 0, items: [] };
            }
            dailyMap[item.date].total += item.amount;
            dailyMap[item.date].items.push(item);
        });

        const sortedDaily = Object.entries(dailyMap)
            .map(([date, data]) => ({ date, total: data.total, items: data.items }))
            .sort((a, b) => {
                const [d1, m1, y1] = a.date.split('.');
                const [d2, m2, y2] = b.date.split('.');
                return new Date(`20${y1}-${m1}-${d1}`) - new Date(`20${y2}-${m2}-${d2}`);
            });

        // Top expenses
        const topExpenses = [...filteredTransactions]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 15);

        // Cumulative data
        let cumulative = 0;
        const cumulativeData = sortedDaily.map(day => {
            cumulative += day.total;
            return { date: day.date, cumulative };
        });

        return {
            totalSpent,
            avgCheck,
            totalCount: filteredTransactions.length,
            sortedGroups,
            sortedDaily,
            topExpenses,
            cumulativeData
        };
    }, [filteredTransactions, isAllProjects, t]);

    const handleOpenModal = (title, items) => {
        setModalConfig({
            isOpen: true,
            title,
            transactions: items
        });
    };

    if (!transactions || transactions.length === 0) {
        return (
            <div className="dashboard-container animate-fade-in">
                <DataRetrieval onImport={onImport} />
            </div>
        );
    }



    const getHeatmapColor = (amount, max) => {
        const intensity = amount / max;
        if (intensity < 0.33) return `rgba(59, 130, 246, ${0.3 + intensity * 0.4})`;
        if (intensity < 0.66) return `rgba(139, 92, 246, ${0.7 + (intensity - 0.33) * 0.2})`;
        return `rgba(239, 68, 68, ${0.9 + (intensity - 0.66) * 0.1})`;
    };

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-filters" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <h3>{t('filter')}:</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        title={t('startDate')}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        title={t('endDate')}
                    />
                </div>
                {(startDate || endDate) && (
                    <button className="secondary small" onClick={() => { setStartDate(''); setEndDate(''); }}>
                        {t('clearFilters')}
                    </button>
                )}
            </div>

            <div className="summary-stats">
                <div className="stat-card">
                    <div className="stat-label">{t('totalExpenses')}</div>
                    <div className="stat-value">{stats.totalSpent.toFixed(0)} PLN</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">{t('averageDaily')}</div>
                    <div className="stat-value">{stats.avgCheck.toFixed(0)} PLN</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">{t('totalItems')}</div>
                    <div className="stat-value">{stats.totalCount}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <h3>🥧 {isAllProjects ? t('expensesByProject') : t('expensesByType')}</h3>
                    <PieChart
                        sortedTypes={stats.sortedGroups}
                        totalSpent={stats.totalSpent}
                        onSliceClick={(name, items) => handleOpenModal(`${name}`, items)}
                    />
                    <div className="stats-list">
                        {stats.sortedGroups.map((item, i) => (
                            <div key={i} className="stat-item" onClick={() => handleOpenModal(item.name, item.items)} style={{ cursor: 'pointer' }}>
                                <div className="stat-name-group">
                                    <div className="stat-color-dot" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <span>{item.name}</span>
                                </div>
                                <div className="stat-amount-group">
                                    <div className="stat-item-amount">{item.value.toFixed(0)} PLN</div>
                                    <div className="stat-item-count">{item.count} {t('items') || 'items'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3>📈 {t('cumulativeGrowth')}</h3>
                    <CumulativeChart data={stats.cumulativeData} />

                    <h3 style={{ marginTop: '2rem' }}>📅 {t('dailyHeatmap')}</h3>
                    <div className="calendar-grid">
                        {stats.sortedDaily.map((day, i) => (
                            <div
                                key={i}
                                className="calendar-day"
                                style={{ backgroundColor: getHeatmapColor(day.total, Math.max(...stats.sortedDaily.map(d => d.total))), cursor: 'pointer' }}
                                onClick={() => handleOpenModal(day.date, day.items)}
                            >
                                <div className="calendar-date">{day.date}</div>
                                <div className="calendar-amount">{day.total.toFixed(0)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="heatmap-legend">
                        <span>{t('low')}</span>
                        <div className="legend-gradient"></div>
                        <span>{t('high')}</span>
                    </div>
                </div>

                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <h3>🏆 {t('topExpenses')}</h3>
                    <div className="top-expenses-list">
                        {stats.topExpenses.map((item, i) => (
                            <div key={i} className="top-expense-item">
                                <div className="top-expense-info">
                                    <div className="top-expense-name">{i + 1}. {item.name}</div>
                                    <div className="top-expense-meta">{item.date} • {isAllProjects ? (item.project || t('budget')) + ' • ' : ''}{item.type}</div>
                                </div>
                                <div className="top-expense-amount">{item.amount} PLN</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <TransactionListModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                transactions={modalConfig.transactions}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
};

export default Dashboard;
