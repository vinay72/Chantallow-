// src/admin/AdminDashboard.jsx
// /admin/dashboard — store totals, monthly charts and the latest orders.
// Numbers come from GET /api/admin/stats; an order's status can be changed
// from the recent-orders table (e.g. mark it delivered).

import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Ban, CircleDollarSign, PackageCheck, ReceiptText, ShoppingCart, Undo2, Users } from 'lucide-react';
import { api } from './api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS = {
  'in-progress': { label: 'In Progress', color: '#3b82c4' },
  delayed: { label: 'Delayed', color: '#d9a21b' },
  delivered: { label: 'Delivered', color: '#3c8a5a' },
  canceled: { label: 'Canceled', color: '#b5483a' },
};

const money = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const shortMoney = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`);

const CARDS = [
  { key: 'users', label: 'Total Users', Icon: Users, color: '#4a6fd1' },
  { key: 'orders', label: 'Total Orders', Icon: ShoppingCart, color: '#2aa3a3' },
  { key: 'order_value', label: 'Total Order Value', Icon: CircleDollarSign, color: '#3c8a5a', money: true },
  { key: 'delivered', label: 'Orders Delivered', Icon: PackageCheck, color: '#5b9b3a' },
  { key: 'canceled', label: 'Orders Cancelled', Icon: Ban, color: '#b5483a' },
  { key: 'returned', label: 'Orders Returned', Icon: Undo2, color: '#d9a21b' },
  { key: 'refund_value', label: 'Total Refund Value', Icon: ReceiptText, color: '#8a5cc2', money: true },
];

function StatCard({ label, value, Icon, color }) {
  return (
    <div className="stat-card" style={{ '--accent': color }}>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
      <Icon className="stat-icon" size={38} strokeWidth={1.5} aria-hidden="true" />
    </div>
  );
}

function ChartCard({ title, children, className = '' }) {
  return (
    <section className={`chart-card ${className}`}>
      <h2>{title}</h2>
      <div className="chart-body">{children}</div>
    </section>
  );
}

export default function AdminDashboard() {
  const [year, setYear] = useState(null); // null = let the server pick this year
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return api
      .stats(year)
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (order, status) => {
    if (status === order.status) return;
    setSavingId(order.id);
    setError(null);
    try {
      await api.setOrderStatus(order.id, status);
      await load(); // totals and charts all depend on status
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const months = (stats?.months || []).map((m) => ({ ...m, name: MONTHS[m.month - 1] }));
  const statusData = (stats?.statuses || [])
    .filter((s) => s.count > 0)
    .map((s) => ({ name: STATUS[s.status].label, value: s.count, color: STATUS[s.status].color }));

  return (
    <div className="dashboard">
      <div className="page-head">
        <h1>Dashboard</h1>
        {stats && (
          <label className="year-pick">
            Year
            <select value={stats.year} onChange={(e) => setYear(Number(e.target.value))}>
              {stats.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {error && (
        <div className="errors">
          <strong>Something went wrong:</strong>
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      {!stats && loading && <div className="empty-state">Loading dashboard…</div>}

      {stats && (
        <>
          <div className="stat-grid">
            {CARDS.map((c) => (
              <StatCard
                key={c.key}
                label={c.label}
                Icon={c.Icon}
                color={c.color}
                value={c.money ? money(stats.totals[c.key]) : stats.totals[c.key].toLocaleString('en-US')}
              />
            ))}
          </div>

          <div className="chart-grid">
            <ChartCard title={`Earnings Overview · ${stats.year}`} className="wide">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={months} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3c8a5a" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3c8a5a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dfe7e1" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickFormatter={shortMoney} tickLine={false} axisLine={false} fontSize={12} width={52} />
                  <Tooltip formatter={(v) => [money(v), 'Order value']} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3c8a5a"
                    strokeWidth={2.5}
                    fill="url(#earn)"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Orders by Status">
              {statusData.length === 0 ? (
                <div className="chart-empty">No orders yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="85%"
                      paddingAngle={2}
                    >
                      {statusData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title={`Orders per Month · ${stats.year}`} className="wide">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={months} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dfe7e1" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={40} />
                  <Tooltip />
                  <Legend iconType="circle" />
                  <Bar dataKey="orders" name="Orders" fill="#2aa3a3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="canceled" name="Cancelled" fill="#b5483a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Recent Orders">
              {stats.recent_orders.length === 0 ? (
                <div className="chart-empty">No orders yet</div>
              ) : (
                <ul className="recent-orders">
                  {stats.recent_orders.map((o) => (
                    <li key={o.id}>
                      <div className="ro-main">
                        <strong>#{o.id}</strong>
                        <span>{o.customer || o.email || 'Guest'}</span>
                        <span className="ro-date">{new Date(o.placed_at).toLocaleDateString()}</span>
                      </div>
                      <div className="ro-side">
                        <span className="ro-total">{money(o.total)}</span>
                        <select
                          value={o.status}
                          disabled={savingId === o.id}
                          onChange={(e) => changeStatus(o, e.target.value)}
                          style={{ '--status': STATUS[o.status].color }}
                          aria-label={`Status of order ${o.id}`}
                        >
                          {Object.entries(STATUS).map(([value, s]) => (
                            <option key={value} value={value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
