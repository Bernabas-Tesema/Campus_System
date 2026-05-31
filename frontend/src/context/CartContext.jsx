import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [loungeId, setLoungeId] = useState(() => {
    const saved = localStorage.getItem('cart_lounge_id');
    if (saved) {
      const parsed = Number(saved);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    const cart = localStorage.getItem('cart');
    if (cart) {
      try {
        const parsed = JSON.parse(cart);
        const first = Array.isArray(parsed) ? parsed[0] : null;
        const lounge = first?.lounge;
        const loungeNumber = typeof lounge === 'number' ? lounge : Number(lounge);
        return Number.isFinite(loungeNumber) && loungeNumber > 0 ? loungeNumber : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (loungeId == null) localStorage.removeItem('cart_lounge_id');
    else if (Number.isFinite(loungeId) && loungeId > 0) localStorage.setItem('cart_lounge_id', String(loungeId));
    else localStorage.removeItem('cart_lounge_id');
  }, [loungeId]);

  const addItem = (food) => {
    setLoungeId((prevLoungeId) => {
      const nextLoungeId = food.lounge;
      if (prevLoungeId != null && prevLoungeId !== nextLoungeId) {
        setItems([{ ...food, quantity: 1 }]);
        return nextLoungeId;
      }

      setItems((prev) => {
        const existing = prev.find((i) => i.id === food.id);
        if (existing) {
          return prev.map((i) => i.id === food.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { ...food, quantity: 1 }];
      });
      return prevLoungeId ?? nextLoungeId;
    });
  };

  const removeItem = (foodId) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== foodId);
      if (next.length === 0) setLoungeId(null);
      return next;
    });
  };

  const updateQuantity = (foodId, quantity) => {
    if (quantity <= 0) return removeItem(foodId);
    setItems((prev) => prev.map((i) => i.id === foodId ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setItems([]);
    setLoungeId(null);
  };

  const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, loungeId, addItem, removeItem, updateQuantity, clearCart, total, itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
