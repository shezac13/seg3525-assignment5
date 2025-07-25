import React from 'react';
import {
    LineChart, Line,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';

const MyChart = ({ data, xKey = 'name', yKey = 'value', yKey2, xName = 'Year', yName = 'Value', yName2, width = 800, height = 500, chartType = 'line', showZeroLine = false }) => {
    const customTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{`${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ margin: 0, color: entry.color }}>
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        if (chartType === 'line') {
            return (
                <LineChart
                    style={{ margin: '20px auto' }}
                    width={width}
                    height={height}
                    data={data}
                    margin={{ top: 8, right: 50, left: 70, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="2 2" />
                    <XAxis
                        dataKey={xKey}
                        label={{ value: xName, angle: 0, position: 'bottom', style: { textAnchor: 'middle' } }}
                        tick={{ fontSize: 16 }}
                    />
                    <YAxis
                        label={{ value: yName, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                        tick={{ fontSize: 16 }}
                        interval={0}
                    />
                    <Tooltip
                        content={customTooltip}
                        allowEscapeViewBox={{ x: false, y: false }}
                        coordinate={{ x: 0, y: 0 }}
                        position={{ x: undefined, y: undefined }}
                    />
                    <Line
                        type="linear"
                        dataKey={yKey}
                        stroke="#3d38a4ff"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 4 }}
                        name={yName}
                    />
                    {yKey2 && (
                        <Line
                            type="linear"
                            dataKey={yKey2}
                            stroke="#ff7c7c"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 4 }}
                            name={yName2 || 'Second Line'}
                        />
                    )}
                    {showZeroLine && (
                        <ReferenceLine y={0} stroke="#ff00006b" strokeWidth={2} />
                    )}

                </LineChart>
            );
        } else if (chartType === 'bar') {
            return (
                <BarChart
                    style={{ margin: '20px auto' }}
                    width={width}
                    height={height}
                    data={data}
                    margin={{ top: 8, right: 50, left: 70, bottom: 60 }}
                    barCategoryGap="20%"
                    barGap={0}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey={xKey}
                        label={{ value: xName, angle: 0, position: 'bottom', style: { textAnchor: 'middle' } }}
                        tick={{ fontSize: 16 }}
                    />
                    <YAxis
                        label={{ value: yName, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                        tick={{ fontSize: 16 }}
                    />
                    <Tooltip content={customTooltip} />
                    <Bar
                        dataKey={yKey}
                        fill="#d44a4aff"
                        name={yName || 'First Bar'}
                    />
                    {yKey2 && (
                        <Bar
                            dataKey={yKey2}
                            fill="#68adeeff"
                            name={yName2 || 'Second Bar'}
                        />
                    )}
                    {/* Shouldn't really be used */}
                    {showZeroLine && (
                        <ReferenceLine y={0} stroke="red" strokeWidth={2} />
                    )}

                </BarChart>
            );
        }
    };
    return (
        <div className="container" style={{ width: '100%', maxWidth: '100%', height: height, margin: '0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '100%' }}>
                {renderChart()}
            </div>
        </div>
    );
};

export default MyChart;
