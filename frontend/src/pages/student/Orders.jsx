import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatBirr } from '../../utils/currency';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const newOrder = location.state?.newOrder;

  const fetchOrders = () => {
    orderAPI.list().then((res) => {
      setOrders(res.data.results || res.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-center py-12">Loading orders...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {newOrder && (
        <div className="card bg-green-50 border-green-200 mb-6">
          <h2 className="text-xl font-bold text-success mb-2">Order Placed Successfully!</h2>
          <p className="text-lg">Your pickup key: <span className="font-mono font-bold text-primary text-2xl">{newOrder.order_key}</span></p>
          <p className="text-gray-600 mt-1">Show this key at the lounge to collect your order.</p>
        </div>
      )}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-mono font-bold text-primary text-lg">{order.order_key}</span>
                <p className="text-sm text-gray-500">{order.lounge_name} · {new Date(order.created_at).toLocaleString()}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="border-t pt-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.food_name} x{item.quantity}</span>
                  <span>{formatBirr(item.subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatBirr(order.total_amount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {orders.length === 0 && <p className="text-center text-gray-500 py-12">No orders yet.</p>}
    </div>
  );
}
