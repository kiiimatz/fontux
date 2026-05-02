import type { FontConfig } from "./index.js";
import { buildCSS, getCSS, getFontPaths } from "./index.js";

const FONT_MIME: Record<string, string> = {
  woff2: "font/woff2",
  woff: "font/woff",
  ttf: "font/ttf",
  otf: "font/otf",
};

type MaybePromise<T> = T | Promise<T>;

interface RequestEvent {
  [key: string]: unknown;
}

interface ResolveOptions {
  transformPageChunk?: (opts: { html: string; done: boolean }) => MaybePromise<string | undefined>;
}

type Handle = (params: {
  event: RequestEvent;
  resolve(event: RequestEvent, opts?: ResolveOptions): Promise<Response>;
}) => MaybePromise<Response>;

function makePreload(path: string): string {
  const ext = path.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  const type = FONT_MIME[ext];
  const typeAttr = type ? ` type="${type}"` : "";
  return `<link rel="preload" href="${path}" as="font"${typeAttr} crossorigin>`;
}

/**
 * Create a SvelteKit `handle` hook with fonts configured at module load time.
 *
 * This is the **recommended approach** for SSR to avoid FOUT (flash of unstyled text).
 * Font styles are built immediately when `createHandle` is called, so they are
 * always available when the HTML `<head>` is transformed — no timing issues.
 *
 * @example
 * ```ts
 * // hooks.server.ts
 * import { createHandle } from "@kiiimatz/fontux/hooks";
 *
 * export const handle = createHandle([
 *   { class: "inter", font: "/fonts/inter.woff2" }
 * ]);
 *
 * // compose with your own handle:
 * import { sequence } from "@sveltejs/kit/hooks";
 * export const handle = sequence(
 *   createHandle([{ class: "inter", font: "/fonts/inter.woff2" }]),
 *   myHandle
 * );
 * ```
 */
export function createHandle(fonts: FontConfig[]): Handle {
  const css = buildCSS(fonts);
  const fontPaths = fonts.flatMap((cfg) =>
    Array.isArray(cfg.font) ? cfg.font : [cfg.font]
  );

  return ({ event, resolve }) =>
    resolve(event, {
      transformPageChunk: ({ html }) => {
        if (!css) return html;
        const preloads = fontPaths.map(makePreload).join("");
        return html
          .replace(/(<head[^>]*>)/, `$1${preloads}`)
          .replace("</head>", `<style id="fontux">${css}</style></head>`);
      },
    });
}

/**
 * SvelteKit `handle` hook that injects fontux styles into the SSR/SSG HTML.
 *
 * **Note:** This requires `fontux()` to be called in `+layout.svelte` before
 * the `<head>` is transformed. If you see a flash of unstyled text, use
 * `createHandle` instead and configure fonts directly in `hooks.server.ts`.
 *
 * @example
 * ```ts
 * // hooks.server.ts
 * export { handle } from "@kiiimatz/fontux/hooks";
 * ```
 */
export const handle: Handle = ({ event, resolve }) => {
  return resolve(event, {
    transformPageChunk: ({ html }) => {
      const css = getCSS();
      if (!css) return html;

      const preloads = getFontPaths().map(makePreload).join("");

      return html
        .replace(/(<head[^>]*>)/, `$1${preloads}`)
        .replace("</head>", `<style id="fontux">${css}</style></head>`);
    },
  });
};
