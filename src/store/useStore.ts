/**
 * Compatibility wrapper — re-exports from domain-specific stores.
 *
 * New code should import directly from:
 *   - @/store/useAuthStore       (user, auth lifecycle)
 *   - @/store/useCollectionStore (models, CRUD, favorites)
 *   - @/store/useIsoStore        (ISO wishlist)
 *
 * This file exists so legacy imports don't break during migration.
 */

export { useAuthStore } from './useAuthStore';
export { useCollectionStore } from './useCollectionStore';
export type { Model } from './useCollectionStore';
export { useIsoStore } from './useIsoStore';
export type { ISOModel } from './useIsoStore';
