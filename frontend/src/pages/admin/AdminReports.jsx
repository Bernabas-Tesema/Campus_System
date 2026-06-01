import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatBirr } from '../../utils/currency';

export default function AdminReports() {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    const load = () => adminAPI.reports().then((res) => setReports(res.data));
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!reports) return <div className="text-center py-12">Loading reports...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Revenue Summary</h2>
          <p className="text-4xl font-bold text-primary">{formatBirr(reports.total_revenue)}</p>
          <p className="text-sm text-gray-500 mt-1">
            All placed orders · {reports.total_orders} total
            {reports.paid_revenue != null && reports.paid_revenue !== reports.total_revenue && (
              <> · {formatBirr(reports.paid_revenue)} paid online</>
            )}
          </p>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">
              Admin profit ({reports.commission_rate_percent ?? 1.5}% of each order)
            </p>
            <p className="text-2xl font-bold text-secondary mt-1">{formatBirr(reports.admin_commission)}</p>
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">System Overview</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Students</span><span className="font-bold">{reports.total_students}</span></div>
            <div className="flex justify-between"><span>Active Lounges</span><span className="font-bold">{reports.total_lounges}</span></div>
            <div className="flex justify-between"><span>Total Orders</span><span className="font-bold">{reports.total_orders}</span></div>
          </div>
        </div>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-3">
          {reports.recent_orders?.map((order) => (
            <div key={order.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <span className="font-mono font-medium text-primary">{order.order_key}</span>
                <span className="text-sm text-gray-500 ml-2">{order.student_name}</span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="font-medium block">{formatBirr(order.total_amount)}</span>
                  {order.payment?.admin_commission != null && (
                    <span className="text-xs text-gray-500">
                      Admin {reports.commission_rate_percent ?? 1.5}%: {formatBirr(order.payment.admin_commission)}
                    </span>
                  )}
                </div>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
