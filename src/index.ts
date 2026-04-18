export type FontDisplay = "auto" | "block" | "swap" | "fallback" | "optional";

export interface FontConfig {
  /**
   * CSS class name to apply this font (e.g. "inter").
   * Omit to apply the font globally to `body`.
   */
  class?: string;
  /**
   * Path(s) to the font file(s). Supports ttf, otf, woff, woff2, eot, svg.
   * Paths are relative to your public directory (e.g. "/fonts/inter.woff2").
   * Pass an array to provide multiple sources for the same font.
   */
  font: string | string[];
  /** Font weight. Defaults to "normal". */
  weight?: string | number;
  /** Font style. Defaults to "normal". */
  style?: string;
  /**
   * Controls how the font is displayed while loading.
   * "swap" (default) shows fallback font immediately then swaps.
   */
  display?: FontDisplay;
  /** Fallback font families appended after the custom font. Defaults to "sans-serif". */
  fallback?: string;
}

const FORMAT_MAP: Record<string, string> = {
  woff2: "woff2",
  woff: "woff",
  ttf: "truetype",
  otf: "opentype",
  eot: "embedded-opentype",
  svg: "svg",
  svgz: "svg",
};

function getFormat(path: string): string {
  const ext = path.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  return FORMAT_MAP[ext] ?? ext;
}

function buildSrc(fonts: string[]): string {
  return fonts
    .map((f) => `url('${f}') format('${getFormat(f)}')`)
    .join(",\n       ");
}

function buildCSS(fonts: FontConfig[]): string {
  return fonts
    .map((cfg, i) => {
      const family = cfg.class ?? `fontrum-${i}`;
      const sources = Array.isArray(cfg.font) ? cfg.font : [cfg.font];
      const weight = cfg.weight ?? "normal";
      const style = cfg.style ?? "normal";
      const display = cfg.display ?? "swap";
      const fallback = cfg.fallback ?? "sans-serif";

      const face = [
        `@font-face{`,
        `font-family:'${family}';`,
        `src:${buildSrc(sources)};`,
        `font-weight:${weight};`,
        `font-style:${style};`,
        `font-display:${display};`,
        `}`,
      ].join("");

      const selector = cfg.class ? `.${cfg.class}` : "body";
      const rule = `${selector}{font-family:'${family}',${fallback};}`;

      return `${face}${rule}`;
    })
    .join("");
}

// Module-level stores (font configs are static, same for all requests)
let _css = "";
let _fontPaths: string[] = [];

/** @internal Used by hooks.server.ts */
export function getCSS(): string {
  return _css;
}

/** @internal Used by hooks.server.ts */
export function getFontPaths(): string[] {
  return _fontPaths;
}

/**
 * Register fonts and inject styles automatically.
 *
 * - **SSR / SSG**: add the fontrum `handle` hook to `hooks.server.ts` once (see below).
 * - **Browser**: injects a `<style>` tag into `document.head` automatically.
 *
 * Call once in your root `+layout.svelte` — no `{@html}` or `<svelte:head>` needed.
 *
 * @example
 * ```svelte
 * <!-- +layout.svelte -->
 * <script>
 *   import { fontrum } from "@kiiimatz/fontrum";
 *   fontrum([{ class: "inter", font: "/fonts/inter.woff2" }]);
 * </script>
 * ```
 *
 * ```ts
 * // hooks.server.ts
 * export { handle } from "@kiiimatz/fontrum/hooks";
 * ```
 */
export function fontrum(fonts: FontConfig[]): void {
  _css = buildCSS(fonts);
  _fontPaths = fonts.flatMap((cfg) =>
    Array.isArray(cfg.font) ? cfg.font : [cfg.font]
  );

  if (typeof document !== "undefined") {
    const id = "fontrum";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = _css;
  }
}

export default fontrum;
