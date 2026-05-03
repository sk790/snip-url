import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import './index.css';

interface AnalyticsData {
  totalClicks: number;
  browsers: Record<string, number>;
  os: Record<string, number>;
  devices: Record<string, number>;
  chartData: { date: string; clicks: number }[];
}

export const AnalyticsModal = ({ urlCode, onClose }: { urlCode: string, onClose: () => void }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:3000/analytics/${urlCode}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [urlCode]);

  const COLORS = ['#66fcf1', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899'];

  const formatPieData = (obj: Record<string, number>) => {
    return Object.keys(obj).map(key => ({ name: key, value: obj[key] }));
  };

  return (
    <div className="modal-overlay">
      <div className="analytics-modal glass-card">
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-light)' }}><Activity size={28} /> Analytics Overview</h2>
          <button onClick={onClose} className="btn-icon-small"><X size={24} /></button>
        </div>

        {loading ? (
          <div className="loading-state" style={{ textAlign: 'center', padding: '3rem' }}>Loading Analytics...</div>
        ) : !data ? (
          <div className="error-state" style={{ textAlign: 'center', padding: '3rem', color: 'var(--error)' }}>Failed to load data</div>
        ) : (
          <div className="analytics-content">
            <div className="stat-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="stat-card glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Total Clicks</h3>
                <div className="stat-value text-gradient" style={{ fontSize: '3rem', fontWeight: 800 }}>{data.totalClicks}</div>
              </div>
              <div className="stat-card glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Top Device</h3>
                <div className="stat-value text-gradient" style={{ fontSize: '3rem', fontWeight: 800 }}>
                  {Object.entries(data.devices).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                </div>
              </div>
            </div>

            <div className="chart-section glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Clicks over time</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={data.chartData}>
                    <XAxis dataKey="date" stroke="var(--text-main)" />
                    <YAxis stroke="var(--text-main)" allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--surface-border)', borderRadius: '12px', color: 'var(--text-light)' }} />
                    <Line type="monotone" dataKey="clicks" stroke="var(--primary)" strokeWidth={4} dot={{ r: 6, fill: 'var(--bg-color)', strokeWidth: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="chart-box glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Top Browsers</h3>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart data={formatPieData(data.browsers).sort((a,b) => b.value - a.value)} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="var(--text-main)" width={80} />
                      <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--surface-border)', borderRadius: '12px', color: 'var(--text-light)' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {formatPieData(data.browsers).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="chart-box glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Operating Systems</h3>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart data={formatPieData(data.os).sort((a,b) => b.value - a.value)} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="var(--text-main)" width={80} />
                      <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--surface-border)', borderRadius: '12px', color: 'var(--text-light)' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {formatPieData(data.os).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
