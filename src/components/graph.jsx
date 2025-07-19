import React from 'react';
import {
    LineChart, Line,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const MyChart = ({ data, xKey = 'name', yKey = 'value', xName = 'Year', yName = 'Value', width = 800, height = 500, title = 'Chart', chartType = 'line' }) => {
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
                    <p style={{ margin: 0, color: '#8884d8' }}>
                        {`${yName}: ${payload[0].value}`}
                    </p>
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
                        label={{ value: xName, angle: 0, position: 'bottom' }}
                        tick={{ fontSize: 16 }}
                    />
                    <YAxis
                        label={{ value: yName, angle: -90, position: 'insideLeft' }}
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
                    />

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
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey={xKey}
                        label={{ value: yName, angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 16 }}
                    />
                    <YAxis
                        label={{ value: yName, angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 16 }}
                    />
                    <Tooltip content={customTooltip} />
                    <Bar
                        dataKey={yKey}
                        fill="#8884d8"
                    />

                </BarChart>
            );
        }
    };
    return (
        <div className="container" style={{ width: '100%', maxWidth: '100%', height: '80%', maxHeight: '80%', margin: '0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '100%'}}>
                {renderChart()}
            </div>
        </div>
    );
};

export default MyChart;
