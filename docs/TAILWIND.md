# Tailwind

[← Back to README](../README.md)

- [Tailwind configuration](#tailwind-configuration)
- [Manually add a `tailwind.site.js` file](#manually-add-a-tailwindsitejs-file)
- [Responsive breakpoints](#responsive-breakpoints)

---

## Tailwind configuration

Tailwind has been updated to v4 in January 2025.

[Update from Tailwind Docs:](https://tailwindcss.com/blog/tailwindcss-v4#css-first-configuration)

One of the biggest changes in Tailwind CSS v4.0 is the shift from configuring your project in JavaScript to configuring it in CSS.

Instead of a `tailwind.config.js` file, you can configure all of your customizations directly in the CSS file where you import Tailwind, giving you one less file to worry about in your project:

```css
@import "tailwindcss";
@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 1920px;
  --color-avocado-100: oklch(0.99 0 0);
  --color-avocado-200: oklch(0.98 0.04 113.22);
  --color-avocado-300: oklch(0.94 0.11 115.03);
  --color-avocado-400: oklch(0.92 0.19 114.08);
  --color-avocado-500: oklch(0.84 0.18 117.33);
  --color-avocado-600: oklch(0.53 0.12 118.34);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
  /* ... */
}
```

The new CSS-first configuration lets you do just about everything you could do in your `tailwind.config.js` file, including configuring your design tokens, defining custom utilities and variants, and more.

To learn more about how it all works, read the new [theme variables documentation](https://tailwindcss.com/docs/theme).

However, you can still create a file similar to `tailwind.config.js` if you need custom configurations.

---

## Manually add a `tailwind.site.js` file

If you need to customize Tailwind (e.g., extend plugins), you can still create a **`js`** file.

1. **Create the file:**
   ```sh
   touch resources/js/tailwind.site.js
   ```

2. **Edit `tailwind.site.js`** to add your custom base styles, components, utilities and variants:
   ```js
   import plugin from 'tailwindcss/plugin'

   export default {
       plugins: [
           // Custom base for this particular site.
           plugin(function({ addBase, theme }) {
               addBase({...})
           }),

           // Custom components for this particular site.
           plugin(function({ addComponents, theme }) {
               addComponents({...})
           }),

           // Custom utilities for this particular site.
           plugin(function({ addUtilities, theme, variants }) {
               addUtilities({...})
           }),

           // Custom variants for this particular site.
           plugin(function ({ addVariant }) {
               addVariant(...);
           }),
       ],
   }
   ```

3. **Import the file** in the CSS file `resources/css/site.css`:
   ```css
   @config '../js/tailwind.site.js';
   ...
   ```

4. **Restart Vite:**
   ```sh
   docker compose exec node npm run dev
   ```

---

## Responsive breakpoints

| Breakpoint | Min width | CSS variable                | Usage example    |
| ---------- | --------- | --------------------------- | ---------------- |
| `xs`       | 0         |                             | `text-lg`        |
| `sm`       | 640px     | `--breakpoint-sm: 640px;`   | `sm:text-lg`     |
| `md`       | 768px     | `--breakpoint-md: 768px;`   | `md:grid-cols-2` |
| `lg`       | 1024px    | `--breakpoint-lg: 1024px;`  | `lg:flex`        |
| `xl`       | 1280px    | `--breakpoint-xl: 1280px;`  | `xl:p-8`         |
| `2xl`      | 1536px    | `--breakpoint-2xl: 1536px;` | `2xl:text-2xl`   |
| `3xl`      | 1700px    | `--breakpoint-3xl: 1700px;` | `3xl:hidden`     |
| `4xl`      | 1920px    | `--breakpoint-4xl: 1920px;` | `4xl:border-top` |

`sm` to `2xl` are Tailwind's defaults. `3xl` and `4xl` are custom and must be declared in the `@theme` block.

*These can be customized in the `statamic/resources/css/site.css` file if needed.*
