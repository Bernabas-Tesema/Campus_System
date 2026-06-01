import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { loadUserCart, saveUserCart } from '../utils/userStorage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState([]);
  const [loungeId, setLoungeId] = useState(null);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoungeId(null);
      return;
    }
    const { items: savedItems, loungeId: savedLounge } = loadUserCart(userId);
    setItems(savedItems);
    setLoungeId(savedLounge);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    saveUserCart(userId, items, loungeId);
  }, [userId, items, loungeId]);

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
          return prev.map((i) => (i.id === food.id ? { ...i, quantity: i.quantity + 1 } : i));
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
    setItems((prev) => prev.map((i) => (i.id === foodId ? { ...i, quantity } : i)));
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
