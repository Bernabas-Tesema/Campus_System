/**
 * Barrel export — keeps existing imports working.
 * Domain APIs live under src/modules/<domain>/services/api.js for portability.
 */
export { authAPI } from '../modules/auth/services/api';
export { foodAPI } from '../modules/food/services/api';
export { orderAPI } from '../modules/orders/services/api';
export { loungeAPI } from '../modules/lounge/services/api';
export { adminAPI } from '../modules/admin/services/api';
export { notificationAPI } from '../modules/notifications/services/api';
export { default } from './client';
