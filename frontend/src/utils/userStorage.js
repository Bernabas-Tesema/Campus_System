const AUTH_KEYS = ['access_token', 'refresh_token'];

export function clearAuthStorage() {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function cartKeys(userId) {
  if (!userId) return null;
  return {
    cart: `cart_${userId}`,
    lounge: `cart_lounge_${userId}`,
  };
}

function parseCart(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function resolveLoungeId(savedLounge, items) {
  if (savedLounge) {
    const parsed = Number(savedLounge);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const first = items[0];
  const lounge = first?.lounge;
  const loungeNumber = typeof lounge === 'number' ? lounge : Number(lounge);
  return Number.isFinite(loungeNumber) && loungeNumber > 0 ? loungeNumber : null;
}

/** Load cart for a user; migrates legacy global `cart` keys once. */
export function loadUserCart(userId) {
  if (!userId) return { items: [], loungeId: null };

  const keys = cartKeys(userId);
  let items = parseCart(localStorage.getItem(keys.cart));
  let loungeId = resolveLoungeId(localStorage.getItem(keys.lounge), items);

  if (items.length === 0) {
    const legacyItems = parseCart(localStorage.getItem('cart'));
    if (legacyItems.length > 0) {
      items = legacyItems;
      loungeId = resolveLoungeId(localStorage.getItem('cart_lounge_id'), items);
      localStorage.setItem(keys.cart, JSON.stringify(items));
      if (loungeId != null) localStorage.setItem(keys.lounge, String(loungeId));
      localStorage.removeItem('cart');
      localStorage.removeItem('cart_lounge_id');
    }
  }

  return { items, loungeId };
}

export function saveUserCart(userId, items, loungeId) {
  if (!userId) return;
  const keys = cartKeys(userId);
  localStorage.setItem(keys.cart, JSON.stringify(items));
  if (loungeId == null) localStorage.removeItem(keys.lounge);
  else if (Number.isFinite(loungeId) && loungeId > 0) localStorage.setItem(keys.lounge, String(loungeId));
  else localStorage.removeItem(keys.lounge);
}
