/**
 * A2UI Constants
 *
 * Shared constants that are safe to import from both server and client code.
 * Kept separate from catalog.ts to avoid pulling in design-system React
 * components when only the catalog ID is needed (e.g., in system prompts).
 */

/**
 * Catalog ID for this implementation.
 * Must match the version used in system prompts and agent messages.
 * Format: <reverse-domain>:<version>
 */
export const CATALOG_ID = 'common-origin.design-system:v2.4';
