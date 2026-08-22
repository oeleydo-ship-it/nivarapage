'use client'

/**
 * Local block renderer fallback.
 * Prefer `@uidesired/blocks`. If that workspace package is unavailable,
 * keep a copy of the switch-based renderer in this file.
 */
export { BlockRenderer, PageRenderer } from "@uidesired/blocks";
export { themeTokensToCssVars, themeTokensToStyle } from "@uidesired/blocks/theme";
