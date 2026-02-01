import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const CumulativeChart = ({ data }) => {
    const { t } = useLanguage();

    if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{t('noDataAvailable')}</div>;

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

export default CumulativeChart;
