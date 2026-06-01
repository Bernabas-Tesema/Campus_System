import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { formatBirr } from '../../utils/currency';

export default function AdminDashboard() {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    const load = () => adminAPI.reports().then((res) => setReports(res.data));
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!reports) return <div className="text-center py-12">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {[
          { label: 'Total Orders', value: reports.total_orders, icon: '📦' },
          { label: 'Order Volume', value: formatBirr(reports.total_revenue), icon: '💰' },
          {
            label: `Admin Profit (${reports.commission_rate_percent ?? 1.5}%)`,
            value: formatBirr(reports.admin_commission),
            icon: '🏛️',
          },
          { label: 'Students', value: reports.total_students, icon: '🎓' },
          { label: 'Active Lounges', value: reports.total_lounges, icon: '🏪' },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Order Status Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {reports.status_breakdown.map((s) => (
            <div key={s.status} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-sm text-gray-500 capitalize">{s.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
