export type FontDisplay = "auto" | "block" | "swap" | "fallback" | "optional";

export interface FontConfig {
  class?: string;
  font: string | string[];
  weight?: string | number;
  style?: string;
  display?: FontDisplay;
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

export function buildCSS(fonts: FontConfig[]): string {
  return fonts
    .map((cfg, i) => {
      const family = cfg.class ?? `fontux-${i}`;
      const sources = Array.isArray(cfg.font) ? cfg.font : [cfg.font];
      const weight = cfg.weight ?? "normal";
      const style = cfg.style ?? "normal";

      // 🔥 ここ変更（swap → optional）
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

export function fontux(fonts: FontConfig[]): void {
  if (typeof document === "undefined") return;

  const css = buildCSS(fonts);
  const id = "fontux";
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

export default fontux;
