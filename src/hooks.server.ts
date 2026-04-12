import { getCSS } from "./index.js";

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
      return html.replace("</head>", `<style id="fontrum">${css}</style></head>`);
    },
  });
};
