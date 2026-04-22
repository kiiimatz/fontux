<div align="center">

# fontrum

**Lightweight font management for SvelteKit.**

[![npm](https://img.shields.io/npm/v/@kiiimatz/fontrum?style=flat-square&color=black)](https://www.npmjs.com/package/@kiiimatz/fontrum)
[![license](https://img.shields.io/npm/l/@kiiimatz/fontrum?style=flat-square&color=black)](./LICENSE)
[![types](https://img.shields.io/npm/types/@kiiimatz/fontrum?style=flat-square&color=black)](./src/index.ts)

Register local fonts and inject `@font-face` styles — no `<svelte:head>`, no manual CSS, no flash of unstyled text.

</div>

---

## Install

```bash
npm install @kiiimatz/fontrum
```

---

## Quick Start

**1. Place your font files in `static/fonts/`**

```
static/
└── fonts/
    └── inter.woff2
```

**2. Add `createHandle` to `hooks.server.ts`**

```ts
// src/hooks.server.ts
import { createHandle } from "@kiiimatz/fontrum/hooks";

export const handle = createHandle([
  { class: "inter", font: "/fonts/inter.woff2" },
]);
```

**3. Use your font in CSS or Tailwind**

```css
/* CSS */
.inter { font-family: "inter", sans-serif; }
```

```html
<!-- Tailwind / class -->
<p class="inter">Hello World!</p>
```

That's it. Works on SSR and SSG with zero flash of unstyled text.

---

## Usage

### Apply a font globally

Omit `class` to apply the font to `body`:

```ts
createHandle([
  { font: "/fonts/inter.woff2" }
])
```

### Multiple fonts

```ts
createHandle([
  { class: "inter",   font: "/fonts/inter.woff2" },
  { class: "mono",    font: "/fonts/jetbrains.woff2" },
  { class: "display", font: "/fonts/cal-sans.woff2" },
])
```

### Multiple sources (for browser compatibility)

```ts
createHandle([
  {
    class: "inter",
    font: ["/fonts/inter.woff2", "/fonts/inter.woff", "/fonts/inter.ttf"],
  },
])
```

### Variable fonts / weights

```ts
createHandle([
  { class: "inter", font: "/fonts/inter-bold.woff2",    weight: 700 },
  { class: "inter", font: "/fonts/inter-regular.woff2", weight: 400 },
])
```

### Composing with an existing hook

```ts
// src/hooks.server.ts
import { createHandle } from "@kiiimatz/fontrum/hooks";
import { sequence } from "@sveltejs/kit/hooks";

export const handle = sequence(
  createHandle([{ class: "inter", font: "/fonts/inter.woff2" }]),
  myHandle
);
```

---

## API

### `createHandle(fonts: FontConfig[]): Handle`

Creates a SvelteKit `handle` hook that injects font styles into every SSR/SSG response.
Font CSS is built once at module load time — no timing issues, no FOUT.

### `FontConfig`

| Property   | Type                 | Default        | Description                                     |
| ---------- | -------------------- | -------------- | ----------------------------------------------- |
| `font`     | `string \| string[]` | —              | Path(s) to the font file, relative to `/static` |
| `class`    | `string`             | —              | CSS class name. Omit to apply to `body`         |
| `weight`   | `string \| number`   | `"normal"`     | Font weight                                     |
| `style`    | `string`             | `"normal"`     | Font style                                      |
| `display`  | `FontDisplay`        | `"swap"`       | `@font-face` font-display value                 |
| `fallback` | `string`             | `"sans-serif"` | Fallback font family                            |

### Supported formats

`woff2` · `woff` · `ttf` · `otf` · `eot` · `svg`

---

## How it works

`createHandle` generates `@font-face` declarations from your config at module load time and stores the CSS in memory. On every request, the `handle` hook injects the CSS and `<link rel="preload">` tags into `<head>` before the response is sent — ensuring fonts are available on the very first render in both SSR and SSG.

---

## License

[MIT](./LICENSE) © [kiiimatz](https://github.com/kiiimatz)
