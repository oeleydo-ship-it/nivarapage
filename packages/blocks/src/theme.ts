import type { CSSProperties } from "react";

export type ThemeTokens = Record<string, unknown>;

const GENERIC_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "ui-rounded",
  "emoji",
  "math",
  "fangsong",
  "inherit",
  "initial",
  "unset",
  "georgia",
  "times",
  "times new roman",
  "arial",
  "helvetica",
  "courier",
  "courier new",
]);

export type FontCategory = "sans" | "serif" | "display" | "mono" | "system";

export type FontEntry = {
  stack: string;
  label: string;
  category: FontCategory;
  /** Google Fonts family name. Omit for system stacks. */
  google?: string;
};

const FONT_CATEGORY_LABELS: Record<FontCategory, string> = {
  sans: "Sans serif",
  serif: "Serif",
  display: "Display",
  mono: "Monospace",
  system: "System",
};

function sans(name: string, google = name): FontEntry {
  return { stack: `${name}, system-ui, sans-serif`, label: name, category: "sans", google };
}

function serif(name: string, google = name): FontEntry {
  return { stack: `${name}, Georgia, serif`, label: name, category: "serif", google };
}

function display(name: string, google = name): FontEntry {
  return { stack: `${name}, system-ui, sans-serif`, label: name, category: "display", google };
}

function mono(name: string, google = name): FontEntry {
  return { stack: `${name}, ui-monospace, monospace`, label: name, category: "mono", google };
}

/** Curated families for the theme picker and per-block type controls. */
export const FONT_CATALOG: FontEntry[] = [
  sans("Inter"),
  sans("Manrope"),
  sans("Poppins"),
  sans("DM Sans"),
  sans("Plus Jakarta Sans"),
  sans("Outfit"),
  sans("Figtree"),
  sans("Space Grotesk"),
  sans("Urbanist"),
  sans("Work Sans"),
  sans("Lato"),
  sans("Montserrat"),
  sans("Open Sans"),
  sans("Raleway"),
  sans("Rubik"),
  sans("Karla"),
  sans("Nunito"),
  sans("Nunito Sans"),
  sans("Source Sans 3"),
  sans("IBM Plex Sans"),
  sans("Sora"),
  sans("Albert Sans"),
  sans("Mulish"),
  sans("Barlow"),
  sans("PT Sans"),
  serif("Playfair Display"),
  serif("Fraunces"),
  serif("Merriweather"),
  serif("Lora"),
  serif("Source Serif 4"),
  serif("EB Garamond"),
  serif("Libre Baskerville"),
  serif("Cormorant Garamond"),
  serif("Newsreader"),
  serif("Instrument Serif"),
  serif("Spectral"),
  serif("DM Serif Display"),
  serif("Libre Caslon Text"),
  display("Syne"),
  display("Oswald"),
  display("Bebas Neue"),
  display("Anton"),
  display("Archivo"),
  display("Yeseva One"),
  display("Cinzel"),
  mono("JetBrains Mono"),
  mono("IBM Plex Mono"),
  mono("Space Mono"),
  mono("Source Code Pro"),
  { stack: "Georgia, serif", label: "Georgia", category: "system" },
  { stack: "ui-monospace, SFMono-Regular, monospace", label: "System Mono", category: "system" },
];

const WEBFONT_FAMILIES = new Set(
  FONT_CATALOG.map((entry) => entry.google).filter((name): name is string => Boolean(name)),
);

export function fontStackOptions(includeTheme = false): Array<[string, string]> {
  const items: Array<[string, string]> = includeTheme ? [["", "Site theme"]] : [];
  for (const entry of FONT_CATALOG) {
    items.push([entry.stack, entry.label]);
  }
  return items;
}

export function fontCatalogGroups(): Array<{ label: string; fonts: FontEntry[] }> {
  const order: FontCategory[] = ["sans", "serif", "display", "mono", "system"];
  return order
    .map((category) => ({
      label: FONT_CATEGORY_LABELS[category],
      fonts: FONT_CATALOG.filter((entry) => entry.category === category),
    }))
    .filter((group) => group.fonts.length > 0);
}

/** All catalog stacks — use in the builder so font pickers can preview each family. */
export function googleFontCatalogHref(): string | null {
  return googleFontHref(...FONT_CATALOG.map((entry) => entry.stack));
}

export function familiesFromStack(stack: string): string[] {
  return stack
    .split(",")
    .map((part) => part.replace(/["']/g, "").trim())
    .filter(Boolean);
}

/** Quote multi-word families so `Playfair Display, Georgia, serif` is valid CSS. */
export function quoteFontStack(stack: string): string {
  return familiesFromStack(stack)
    .map((name) => {
      if (GENERIC_FAMILIES.has(name.toLowerCase())) return name;
      return /[^A-Za-z0-9-]/.test(name) ? `"${name}"` : name;
    })
    .join(", ");
}

export function webfontFamilies(...stacks: Array<string | null | undefined>): string[] {
  const families = new Set<string>();
  for (const stack of stacks) {
    if (!stack || typeof stack !== "string") continue;
    for (const name of familiesFromStack(stack)) {
      if (WEBFONT_FAMILIES.has(name)) families.add(name);
    }
  }
  return [...families];
}

export function googleFontHref(...stacks: Array<string | null | undefined>): string | null {
  const families = webfontFamilies(...stacks);
  if (!families.length) return null;
  const query = families
    .map((name) => `family=${encodeURIComponent(name).replace(/%20/g, "+")}:wght@300;400;500;600;700;800`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

export function fontStacksFromContent(content: {
  sections?: Array<{ props?: Record<string, unknown> | null }>;
} | null | undefined): string[] {
  const stacks: string[] = [];
  for (const section of content?.sections ?? []) {
    const heading = section.props?.headingFont;
    const body = section.props?.bodyFont;
    if (typeof heading === "string") stacks.push(heading);
    if (typeof body === "string") stacks.push(body);
  }
  return stacks;
}

const COLOR_KEYS = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
  "text",
  "muted",
] as const;

/**
 * Canonical variable names. These must match the ones the block stylesheet and
 * the builder canvas use, otherwise published pages lose the site typography.
 */
const TOKEN_TO_VAR: Record<string, string> = {
  headingFont: "--font-heading",
  bodyFont: "--font-body",
  monoFont: "--font-mono",
  serifFont: "--font-serif",
  headingWeight: "--font-heading-weight",
  bodyWeight: "--font-body-weight",
  buttonRadius: "--radius-button",
  cardRadius: "--radius-card",
  containerWidth: "--container-width",
  sectionSpacing: "--section-spacing",
};

export function themeTokensToCssVars(tokens: ThemeTokens | null | undefined): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!tokens) {
    return vars;
  }

  for (const key of COLOR_KEYS) {
    const value = tokens[key];
    if (typeof value === "string" && value.trim()) {
      vars[`--color-${key}`] = value.trim();
    }
  }

  for (const [key, cssVar] of Object.entries(TOKEN_TO_VAR)) {
    const value = tokens[key];
    if (typeof value === "string" && (key === "headingFont" || key === "bodyFont" || key === "monoFont" || key === "serifFont")) {
      vars[cssVar] = quoteFontStack(value);
    } else if (typeof value === "string" || typeof value === "number") {
      vars[cssVar] = String(value);
    }
  }

  return vars;
}

export function themeTokensToStyle(tokens: ThemeTokens | null | undefined): CSSProperties {
  return themeTokensToCssVars(tokens) as CSSProperties;
}
