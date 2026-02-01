import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

const PieChart = ({ sortedTypes, totalSpent, onSliceClick }) => {
    const { t } = useLanguage();

    if (totalSpent === 0) return (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{t('noDataAvailable')}</div>
    );

    const size = 300;
    const center = size / 2;
    const radius = size / 2 - 20;

    let currentAngle = 0;
    const slices = [];

    sortedTypes.forEach((item, i) => {
        const percentage = (item.value / totalSpent) * 100;
        const angle = (item.value / totalSpent) * 360;
        const endAngle = currentAngle + angle;

        const startX = center + radius * Math.cos((currentAngle - 90) * Math.PI / 180);
        const startY = center + radius * Math.sin((currentAngle - 90) * Math.PI / 180);
        const endX = center + radius * Math.cos((endAngle - 90) * Math.PI / 180);
        const endY = center + radius * Math.sin((endAngle - 90) * Math.PI / 180);

        const largeArc = angle > 180 ? 1 : 0;

        const path = angle === 360
            ? [`M ${center} ${center - radius}`, `A ${radius} ${radius} 0 1 1 ${center} ${center + radius}`, `A ${radius} ${radius} 0 1 1 ${center} ${center - radius}`, 'Z'].join(' ')
            : [
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
            name: item.name,
            items: item.items
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
                            onClick={() => onSliceClick(slice.name, slice.items)}
                            style={{ cursor: 'pointer' }}
                        >
                            <title>{slice.name}: {slice.percentage}% - Click to view</title>
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
                                style={{ transform: 'rotate(90deg)', transformOrigin: `${slice.labelX}px ${slice.labelY}px`, pointerEvents: 'none' }}
                            >
                                {slice.percentage}%
                            </text>
                        )}
                    </React.Fragment>
                ))}
            </svg>
            <div className="pie-legend">
                {slices.map((slice, i) => (
                    <div key={i} className="legend-item" onClick={() => onSliceClick(slice.name, slice.items)} style={{ cursor: 'pointer' }}>
                        <div className="stat-color-dot" style={{ backgroundColor: slice.color }}></div>
                        <span>{slice.name} ({slice.percentage}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChart;
