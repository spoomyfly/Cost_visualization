import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { getColorForName } from '../utils/chartColors';

const BarChart = ({ data, onBarClick }) => {
    const { t } = useLanguage();

    if (!data || data.length === 0) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{t('noDataAvailable')}</div>;
    }

    const width = 600;
    const height = 320;
    const padding = { top: 24, right: 20, bottom: 60, left: 46 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = Math.max(...data.map(d => d.value));
    const niceMax = Math.ceil(maxValue / 100) * 100 || 100;

    const barSlot = chartWidth / data.length;
    const barWidth = Math.min(barSlot * 0.6, 70);

    const bars = data.map((item, i) => {
        const barHeight = (item.value / niceMax) * chartHeight;
        const x = padding.left + i * barSlot + (barSlot - barWidth) / 2;
        const y = padding.top + chartHeight - barHeight;
        return { ...item, x, y, barHeight, color: getColorForName(item.name) };
    });

    return (
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
            {/* Y-axis grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
                const y = padding.top + chartHeight - tick * chartHeight;
                return (
                    <React.Fragment key={i}>
                        <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.1)" />
                        <text x={padding.left - 8} y={y} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize="10" dominantBaseline="middle">
                            {(tick * niceMax).toFixed(0)}
                        </text>
                    </React.Fragment>
                );
            })}

            {/* Bars */}
            {bars.map((bar, i) => (
                <g
                    key={i}
                    onClick={() => onBarClick && onBarClick(bar.name, bar.items)}
                    style={{ cursor: onBarClick ? 'pointer' : 'default' }}
                >
                    <rect x={bar.x} y={bar.y} width={barWidth} height={Math.max(bar.barHeight, 1)} fill={bar.color} rx="4">
                        <title>{bar.name}: {bar.value.toFixed(0)} PLN ({bar.count} {t('items') || 'items'})</title>
                    </rect>
                    <text x={bar.x + barWidth / 2} y={bar.y - 6} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                        {bar.value.toFixed(0)}
                    </text>
                    <text
                        x={bar.x + barWidth / 2}
                        y={padding.top + chartHeight + 14}
                        textAnchor="end"
                        fill="rgba(255,255,255,0.6)"
                        fontSize="10"
                        transform={`rotate(-35 ${bar.x + barWidth / 2} ${padding.top + chartHeight + 14})`}
                    >
                        {bar.name.length > 12 ? `${bar.name.slice(0, 11)}…` : bar.name}
                        <title>{bar.name}</title>
                    </text>
                </g>
            ))}
        </svg>
    );
};

export default BarChart;
