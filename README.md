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

**1. Call `fontrum()` in your root layout**

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { fontrum } from "@kiiimatz/fontrum";

  fontrum([
    { class: "inter", font: "/fonts/inter.woff2" },
  ]);
</script>
```

**2. Add the server hook for SSR / SSG**

```ts
// src/hooks.server.ts
export { handle } from "@kiiimatz/fontrum/hooks";
```

**3. Use your font in CSS**

```css
.inter {
  font-family: "inter", sans-serif;
}
```

That's it. No `{@html}`, no manual `<style>` tags.

---

## Usage

### Apply a font globally

Omit `class` to apply the font to `body`:

```ts
fontrum([
  { font: "/fonts/inter.woff2" }
]);
```

### Multiple fonts

```ts
fontrum([
  { class: "inter",   font: "/fonts/inter.woff2" },
  { class: "mono",    font: "/fonts/jetbrains.woff2" },
  { class: "display", font: "/fonts/cal-sans.woff2" },
]);
```

### Multiple sources (for browser compatibility)

```ts
fontrum([
  {
    class: "inter",
    font: ["/fonts/inter.woff2", "/fonts/inter.woff", "/fonts/inter.ttf"],
  },
]);
```

### Variable fonts / weights

```ts
fontrum([
  { class: "inter", font: "/fonts/inter-bold.woff2", weight: 700 },
  { class: "inter", font: "/fonts/inter-regular.woff2", weight: 400 },
]);
```

### Composing with an existing hook

```ts
// src/hooks.server.ts
import { handle as fontrumHandle } from "@kiiimatz/fontrum/hooks";
import { sequence } from "@sveltejs/kit/hooks";

export const handle = sequence(fontrumHandle, myHandle);
```

---

## API

### `fontrum(fonts: FontConfig[]): void`

Registers fonts and injects styles.

- **SSR / SSG** — styles are injected into `<head>` via the server hook.
- **Browser** — a `<style id="fontrum">` tag is written to `document.head`.

### `FontConfig`

| Property    | Type                      | Default        | Description                                           |
| ----------- | ------------------------- | -------------- | ----------------------------------------------------- |
| `font`      | `string \| string[]`      | —              | Path(s) to the font file, relative to `/public`       |
| `class`     | `string`                  | —              | CSS class name. Omit to apply to `body`               |
| `weight`    | `string \| number`        | `"normal"`     | Font weight                                           |
| `style`     | `string`                  | `"normal"`     | Font style                                            |
| `display`   | `FontDisplay`             | `"swap"`       | `@font-face` font-display value                       |
| `fallback`  | `string`                  | `"sans-serif"` | Fallback font family                                  |

### Supported formats

`woff2` · `woff` · `ttf` · `otf` · `eot` · `svg`

---

## How it works

`fontrum()` generates `@font-face` declarations from your config and stores them in memory.

- On the **server**, the `handle` hook intercepts each response and injects the CSS before `</head>`, ensuring zero flash of unstyled text on SSR and SSG pages.
- In the **browser**, it writes a `<style>` tag on first call and updates it on subsequent calls.

---

## License

[MIT](./LICENSE) © [kiiimatz](https://github.com/kiiimatz)
