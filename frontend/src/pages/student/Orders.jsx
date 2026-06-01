import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, notificationAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import OrderStatusTimeline from '../../modules/orders/components/OrderStatusTimeline';
import { formatBirr } from '../../utils/currency';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const location = useLocation();
  const newOrder = location.state?.newOrder;
  const prevStatusesRef = useState({})[0];

  const notifyReady = useCallback((order) => {
    const body = `Order ${order.order_key} is ready for pickup.`;
    if (window.Notification?.permission === 'granted') {
      new Notification('Your food is ready!', { body });
    } else if (window.Notification?.permission !== 'denied') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') new Notification('Your food is ready!', { body });
      });
    }
  }, []);

  const fetchOrders = useCallback(() => {
    orderAPI.list().then((res) => {
      const latest = res.data.results || res.data;
      latest.forEach((o) => {
        const prev = prevStatusesRef[o.id];
        if (prev && prev !== 'ready' && o.status === 'ready') {
          notifyReady(o);
        }
        prevStatusesRef[o.id] = o.status;
      });
      setOrders(latest);
    }).finally(() => setLoading(false));
  }, [notifyReady, prevStatusesRef]);

  const fetchNotifications = useCallback(() => {
    notificationAPI
      .list()
      .then((res) => setNotifications(res.data.results || res.data || []))
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;
    if (window.Notification?.permission === 'default') {
      Notification.requestPermission();
    }
    setLoading(true);
    fetchOrders();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchOrders();
      fetchNotifications();
    }, 5000);
    const countdown = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [user?.id, fetchOrders, fetchNotifications]);

  const readyNotifications = notifications.filter(
    (n) => !n.is_read && (n.message?.toLowerCase().includes('ready') || n.title?.toLowerCase().includes('ready')),
  );

  const acceptedNotifications = notifications.filter(
    (n) => !n.is_read && n.message?.toLowerCase().includes('accepted'),
  );

  if (loading) return <div className="text-center py-12">Loading orders...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {acceptedNotifications.length > 0 && (
        <div className="card bg-blue-50 border-blue-200 mb-6 space-y-2">
          <h2 className="text-lg font-bold text-secondary">Order accepted</h2>
          {acceptedNotifications.slice(0, 3).map((n) => (
            <p key={n.id} className="text-sm text-gray-800">
              <span className="font-medium">{n.title}</span> — {n.message}
            </p>
          ))}
        </div>
      )}

      {readyNotifications.length > 0 && (
        <div className="card bg-green-50 border-green-200 mb-6 space-y-2">
          <h2 className="text-lg font-bold text-success">Your food is ready!</h2>
          {readyNotifications.slice(0, 5).map((n) => (
            <p key={n.id} className="text-sm text-gray-800">
              <span className="font-medium">{n.title}</span> — {n.message}
            </p>
          ))}
        </div>
      )}

      {newOrder && (
        <div className="card bg-blue-50 border-blue-200 mb-6">
          <h2 className="text-xl font-bold text-secondary mb-2">Order placed!</h2>
          <p className="text-lg">
            Pickup key:{' '}
            <span className="font-mono font-bold text-primary text-2xl">{newOrder.order_key}</span>
          </p>
          <p className="text-gray-600 mt-2">
            Waiting for the lounge to <strong>accept</strong> your order. Prep time depends on the items you ordered.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={`${order.id}-${tick}`} className="card">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="font-mono font-bold text-primary text-lg">{order.order_key}</span>
                <p className="text-sm text-gray-500">
                  {order.lounge_name} · {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <OrderStatusTimeline order={order} />

            <div className="border-t pt-3 mt-3">
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
