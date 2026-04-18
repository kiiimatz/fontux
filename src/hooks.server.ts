import { getCSS, getFontPaths } from "./index.js";

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

/**
 * SvelteKit `handle` hook that injects fontrum styles into the SSR/SSG HTML.
 *
 * @example
 * ```ts
 * // hooks.server.ts
 * export { handle } from "@kiiimatz/fontrum/hooks";
 *
 * // or compose with your own handle:
 * import { handle as fontrumHandle } from "@kiiimatz/fontrum/hooks";
 * import { sequence } from "@sveltejs/kit/hooks";
 * export const handle = sequence(fontrumHandle, myHandle);
 * ```
 */
export const handle: Handle = ({ event, resolve }) => {
  return resolve(event, {
    transformPageChunk: ({ html }) => {
      const css = getCSS();
      if (!css) return html;

      const preloads = getFontPaths()
        .map((path) => {
          const ext = path.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
          const type = FONT_MIME[ext];
          const typeAttr = type ? ` type="${type}"` : "";
          return `<link rel="preload" href="${path}" as="font"${typeAttr} crossorigin>`;
        })
        .join("");

      return html
        .replace(/(<head[^>]*>)/, `$1${preloads}`)
        .replace("</head>", `<style id="fontrum">${css}</style></head>`);
    },
  });
};
