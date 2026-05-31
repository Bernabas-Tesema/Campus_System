import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import StatusBadge, { STATUS_FLOW } from '../../components/StatusBadge';
import { formatBirr } from '../../utils/currency';

export default function LoungeOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = () => {
    setError('');
    orderAPI.loungeOrders(filter ? { status: filter } : {})
      .then((res) => setOrders(res.data.results || res.data))
      .catch((err) => {
        const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to load orders.';
        setError(msg);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    if (error) return;
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [filter, error]);

  const updateStatus = async (orderId, status) => {
    setError('');
    try {
      await orderAPI.loungeUpdateStatus(orderId, status);
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to update status.';
      setError(msg);
    }
  };

  if (loading) return <div className="text-center py-12">Loading orders...</div>;

  if (error) {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">Lounge Account</h1>
        <p className="text-gray-600">{error}</p>
        <p className="text-sm text-gray-500 mt-2">An admin needs to activate your lounge to start receiving orders.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Incoming Orders</h1>
        <select className="input max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending', 'accepted', 'preparing', 'ready', 'completed', 'rejected'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-mono font-bold text-primary text-xl">{order.order_key}</span>
                <p className="text-sm text-gray-500">{order.student_name} · {new Date(order.created_at).toLocaleString()}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="border-t pt-3 mb-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.food_name} x{item.quantity}</span>
                  <span>{formatBirr(item.subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span>{formatBirr(order.total_amount)}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(STATUS_FLOW[order.status] || []).map((nextStatus) => (
                <button
                  key={nextStatus}
                  onClick={() => updateStatus(order.id, nextStatus)}
                  className={`text-sm px-3 py-1.5 rounded-lg font-medium ${
                    nextStatus === 'rejected' ? 'bg-red-100 text-error hover:bg-red-200' : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {orders.length === 0 && <p className="text-center text-gray-500 py-12">No orders to display.</p>}
    </div>
  );
}
