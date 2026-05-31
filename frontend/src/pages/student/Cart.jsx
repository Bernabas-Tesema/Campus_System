import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderAPI } from '../../services/api';
import { formatBirr } from '../../utils/currency';

export default function Cart() {
  const { items, loungeId, total, updateQuantity, removeItem, clearCart } = useCart();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleOrder = async () => {
    if (!items.length) return;
    setLoading(true);
    setError('');
    try {
      const rawLoungeId = loungeId ?? items[0]?.lounge;
      const resolvedLoungeId = typeof rawLoungeId === 'number' ? rawLoungeId : Number(rawLoungeId);
      if (!Number.isFinite(resolvedLoungeId) || resolvedLoungeId <= 0) {
        setError('Your cart is out of date. Please clear the cart and add items again.');
        return;
      }
      const res = await orderAPI.create({
        lounge_id: resolvedLoungeId,
        items: items.map((i) => ({ food_id: i.id, quantity: i.quantity })),
        notes,
      });
      clearCart();
      navigate('/orders', { state: { newOrder: res.data } });
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.error ||
        (typeof data === 'string' ? data : null) ||
        (data && typeof data === 'object'
          ? Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : String(v)}`)
            .join(' | ')
          : null) ||
        'Failed to place order.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="text-center py-16">
        <span className="text-6xl">🛒</span>
        <h2 className="text-2xl font-bold mt-4">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Browse the menu and add some delicious food!</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {error && <div className="bg-red-50 text-error p-3 rounded-lg mb-4">{error}</div>}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="card flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-500">{formatBirr(item.price)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-gray-100 font-bold">-</button>
              <span className="font-medium w-6 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-gray-100 font-bold">+</button>
              <span className="font-bold text-primary ml-2">{formatBirr(parseFloat(item.price) * item.quantity)}</span>
              <button onClick={() => removeItem(item.id)} className="text-error ml-2 text-sm">Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="flex justify-between text-xl font-bold mb-4">
          <span>Total</span>
          <span className="text-primary">{formatBirr(total)}</span>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button onClick={handleOrder} className="btn-primary w-full text-lg" disabled={loading}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
