import React, { useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

const Dashboard = ({ transactions }) => {
    const { t } = useLanguage();
    if (!transactions || transactions.length === 0) {
        return (
            <div className="dashboard-container animate-fade-in">
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
                    <h2>{t('noDataAvailable')}</h2>
                    <p style={{ color: '#94a3b8' }}>{t('noDataDesc')}</p>
                </div>
            </div>
        );
    }

    const stats = useMemo(() => {
        const totalSpent = transactions.reduce((sum, item) => sum + item.amount, 0);
        const avgCheck = transactions.length > 0 ? totalSpent / transactions.length : 0;

        // Type stats
        const typeMap = {};
        transactions.forEach(item => {
            if (!typeMap[item.type]) {
                typeMap[item.type] = { total: 0, count: 0 };
            }
            typeMap[item.type].total += item.amount;
            typeMap[item.type].count += 1;
        });

        const sortedTypes = Object.entries(typeMap)
            .map(([name, data]) => ({
                name,
                value: data.total,
                count: data.count
            }))
            .sort((a, b) => b.value - a.value);

        // Daily stats
        const dailyMap = {};
        transactions.forEach(item => {
            if (!dailyMap[item.date]) {
                dailyMap[item.date] = 0;
            }
            dailyMap[item.date] += item.amount;
        });

        const sortedDaily = Object.entries(dailyMap)
            .map(([date, total]) => ({ date, total }))
            .sort((a, b) => {
                const [d1, m1, y1] = a.date.split('.');
                const [d2, m2, y2] = b.date.split('.');
                return new Date(`20${y1}-${m1}-${d1}`) - new Date(`20${y2}-${m2}-${d2}`);
            });

        // Top expenses
        const topExpenses = [...transactions]
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
            totalCount: transactions.length,
            sortedTypes,
            sortedDaily,
            topExpenses,
            cumulativeData
        };
    }, [transactions]);

    const renderPieChart = () => {
        const total = stats.totalSpent;
        if (total === 0) return null;

        const size = 300;
        const center = size / 2;
        const radius = size / 2 - 20;

        let currentAngle = 0;
        const slices = [];

        stats.sortedTypes.forEach((item, i) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const endAngle = currentAngle + angle;

            const startX = center + radius * Math.cos((currentAngle - 90) * Math.PI / 180);
            const startY = center + radius * Math.sin((currentAngle - 90) * Math.PI / 180);
            const endX = center + radius * Math.cos((endAngle - 90) * Math.PI / 180);
            const endY = center + radius * Math.sin((endAngle - 90) * Math.PI / 180);

            const largeArc = angle > 180 ? 1 : 0;

            const path = [
                `M ${center} ${center}`,
                `L ${startX} ${startY}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
                'Z'
            ].join(' ');

            const labelAngle = currentAngle + angle / 2;
            const labelRadius = radius * 0.7;
            const labelX = center + labelRadius * Math.cos((labelAngle - 90) * Math.PI / 180);
            const labelY = center + labelRadius * Math.sin((labelAngle - 90) * Math.PI / 180);

            slices.push({
                path,
                color: COLORS[i % COLORS.length],
                labelX,
                labelY,
                percentage: percentage.toFixed(0),
                name: item.name
            });

            currentAngle = endAngle;
        });

        return (
            <div className="pie-chart-container">
                <svg viewBox={`0 0 ${size} ${size}`} className="pie-chart-svg">
                    {slices.map((slice, i) => (
                        <React.Fragment key={i}>
                            <path
                                d={slice.path}
                                fill={slice.color}
                                className="pie-slice"
                            >
                                <title>{slice.name}: {slice.percentage}%</title>
                            </path>
                            {parseFloat(slice.percentage) > 5 && (
                                <text
                                    x={slice.labelX}
                                    y={slice.labelY}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="white"
                                    fontSize="12"
                                    fontWeight="bold"
                                    style={{ transform: 'rotate(90deg)', transformOrigin: `${slice.labelX}px ${slice.labelY}px` }}
                                >
                                    {slice.percentage}%
                                </text>
                            )}
                        </React.Fragment>
                    ))}
                </svg>
                <div className="pie-legend">
                    {slices.map((slice, i) => (
                        <div key={i} className="legend-item">
                            <div className="stat-color-dot" style={{ backgroundColor: slice.color }}></div>
                            <span>{slice.name} ({slice.percentage}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderCumulativeChart = () => {
        const data = stats.cumulativeData;
        if (data.length === 0) return null;

        const width = 600;
        const height = 300;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const maxValue = data[data.length - 1].cumulative;
        const niceMax = Math.ceil(maxValue / 1000) * 1000 || 1000;

        const points = data.map((item, i) => {
            const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
            const y = height - padding - (item.cumulative / niceMax) * chartHeight;
            return { x, y, ...item };
        });

        const linePath = points.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ');

        const areaPath = `
      M ${padding} ${height - padding}
      L ${points[0].x} ${points[0].y}
      ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
      L ${points[points.length - 1].x} ${height - padding}
      Z
    `;

        return (
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
                <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 0.5 }} />
                        <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 0 }} />
                    </linearGradient>
                </defs>

                {/* Y-axis grid */}
                {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
                    const y = height - padding - tick * chartHeight;
                    return (
                        <React.Fragment key={i}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.1)" />
                            <text x={padding - 5} y={y} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize="10" dominantBaseline="middle">
                                {(tick * niceMax).toFixed(0)}
                            </text>
                        </React.Fragment>
                    );
                })}

                <path d={areaPath} fill="url(#chartGradient)" />
                <path d={linePath} fill="none" stroke="#8B5CF6" strokeWidth="3" />

                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="#8B5CF6">
                        <title>{p.date}: {p.cumulative.toFixed(0)} PLN</title>
                    </circle>
                ))}

                {/* X-axis labels */}
                {points.filter((_, i) => i % Math.ceil(points.length / 5) === 0 || i === points.length - 1).map((p, i) => (
                    <text key={i} x={p.x} y={height - padding + 20} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">
                        {p.date.split('.').slice(0, 2).join('.')}
                    </text>
                ))}
            </svg>
        );
    };

    const getHeatmapColor = (amount, max) => {
        const intensity = amount / max;
        if (intensity < 0.33) return `rgba(59, 130, 246, ${0.3 + intensity * 0.4})`;
        if (intensity < 0.66) return `rgba(139, 92, 246, ${0.7 + (intensity - 0.33) * 0.2})`;
        return `rgba(239, 68, 68, ${0.9 + (intensity - 0.66) * 0.1})`;
    };

    return (
        <div className="dashboard-container animate-fade-in">
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
                    <h3>🥧 {t('expensesByType')}</h3>
                    {renderPieChart()}
                    <div className="stats-list">
                        {stats.sortedTypes.map((item, i) => (
                            <div key={i} className="stat-item">
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
                    {renderCumulativeChart()}

                    <h3 style={{ marginTop: '2rem' }}>📅 {t('dailyHeatmap')}</h3>
                    <div className="calendar-grid">
                        {stats.sortedDaily.map((day, i) => (
                            <div
                                key={i}
                                className="calendar-day"
                                style={{ backgroundColor: getHeatmapColor(day.total, Math.max(...stats.sortedDaily.map(d => d.total))) }}
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
                                    <div className="top-expense-meta">{item.date} • {item.type}</div>
                                </div>
                                <div className="top-expense-amount">{item.amount} PLN</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
