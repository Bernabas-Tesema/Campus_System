import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../services/api';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const load = useCallback(() => {
    notificationAPI
      .list()
      .then((res) => setItems(res.data.results || res.data || []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  const unread = items.filter((n) => !n.is_read).length;

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    load();
  };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    load();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-white text-gray-900 shadow-xl border border-gray-100 z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">Notifications</span>
              {unread > 0 && (
                <button type="button" onClick={markAllRead} className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">No notifications yet</p>
            ) : (
              <ul className="divide-y">
                {items.slice(0, 20).map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 text-sm ${n.is_read ? 'bg-white' : 'bg-orange-50/50'}`}
                  >
                    <p className="font-medium text-secondary">{n.title}</p>
                    <p className="text-gray-600 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={() => markRead(n.id)}
                        className="text-xs text-primary mt-1 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t px-4 py-2">
              <Link
                to="/orders"
                onClick={() => setOpen(false)}
                className="text-xs text-primary hover:underline"
              >
                View my orders
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
