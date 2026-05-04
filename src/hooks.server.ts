import type { FontConfig } from "./index.js";
import { buildCSS } from "./index.js";

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
  return `<link rel="preload" href="${path}" as="font"${typeAttr} crossorigin fetchpriority="high">`;
}

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
