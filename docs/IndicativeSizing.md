# Constructure — Indicative Sizing

A small web app on the Constructure site that gives **indicative structural
depths for early feasibility**. It is linked from the Practice page and lives at
**https://<site>/sizing**.

> Nothing here is a design. The tool returns published rules of thumb only.
> Every element must be designed and checked by a chartered engineer.

---

## What it's for

Architects, developers and clients often need a quick sense of how deep a slab
or beam will be when they are testing an idea on a plan, long before an engineer
is appointed. This tool gives them that rough number in a few seconds. It
introduces Constructure's way of working and gives them an easy way to get in
touch for a proper view.

### Who uses it

- **Architects and designers** checking floor-to-floor heights and zones at
  concept stage.
- **Developers and clients** sense-checking a scheme before feasibility.
- **Constructure staff** as a quick reference in meetings or on site. It can be
  installed on a phone and works offline.

### How it works

1. **Disclaimer first.** On opening, a short notice explains that the tool is a
   feasibility sketchpad, not a design tool, and that it knows nothing about
   loads, ground conditions or geometry. The visitor must press
   "I understand — continue" to use it.
2. **Inputs**
   - **Material:** concrete, steel or timber.
   - **Structural system:** for example a one-way, two-way, flat,
     post-tensioned or ribbed slab, an RC or transfer beam, a UB floor, roof,
     composite or primary beam, a UC, a softwood joist, glulam or LVL.
   - **Span:** a slider limited to the range that suits each system.
   - **Loading:** light, medium or heavy.
3. **Outputs**
   - An **indicative depth range** in mm, from span/depth ratios, with the ratio
     shown. For steel it also gives the nearest **UB/UC serial size range**.
   - A **section sketch** with the depth and span marked up.
   - A short note on the chosen system, for example "punching shear at columns
     to check".
   - **Reference cards** for typical imposed loads (EN 1991-1-1 / UK NA),
     material weights, column grids and London-specific notes.
4. **Sharing**
   - **Email to Constructure** opens the visitor's own mail app with a
     pre-filled message to office@constructure.co.uk. Nothing is sent by the
     site itself.
   - **Save image** downloads a branded PNG sketch, with the disclaimer.
   - **Copy** puts a text summary on the clipboard.
5. **Colourways:** blue, green or dark, with the matching Constructure logo.

### Privacy and data

- No accounts, forms, tracking or API keys. Nothing the visitor enters leaves
  their browser unless they choose to email it.
- The only external request is Google Fonts (Hanken Grotesk).
- A service worker caches the app so it works offline. It is limited to
  `/sizing/` and does not affect the rest of the website.

---

## The "Install app" button

The tool is a **Progressive Web App (PWA)**. Visitors can use it on the website,
or install it so that it behaves like a normal app.

### What is a PWA?

A **Progressive Web App** is an ordinary website that a browser can also
install like an app. Two small files make that possible:

- **`manifest.webmanifest`** gives the app its name ("Sizing"), its icon and
  colours, and tells the browser to open it in its own window.
- **`sw.js`**, the *service worker*, is a script the browser keeps in the
  background. It saves the app's files on the device so the tool opens and
  works **offline**.

There is **no app store**: no submission, review or fee. The website is the
app.
Updates work the same way as the rest of the site. Deploy the changed files
and **bump `VERSION` in `sw.js`**. Installed copies then pick up the new
version the next time they open with a connection.

### What installing does

- It adds a **Constructure "Sizing" icon** to the phone's home screen, or to the
  computer's apps (Start menu, Dock or Launchpad).
- The tool opens in **its own window**, without the browser's address bar or
  tabs.
- It **works offline**, which is useful on site with poor signal.
- It is still the same tool from `/sizing`. Nothing is downloaded from an app
  store, and the visitor can uninstall it like any other app.

### When the button appears

The button only shows when the browser says the app can be installed, so many
visitors won't see it:

- **Chrome, Edge, Samsung Internet and similar browsers** on Android, Windows,
  macOS or ChromeOS. Pressing it opens the browser's own "Install" prompt.
- Only over **HTTPS**, which the live site uses.
- It hides once the app is installed, or if the visitor dismisses the prompt.
  These browsers also offer an install icon in the address bar.
- **"Works offline"** next to it is a label, not a button. It appears once the
  offline cache is ready.

### iPhone and iPad (Safari)

Safari never shows the button, because iOS has no install prompt that a website
can trigger. To install there: tap **Share**, then **Add to Home Screen**. The
result is the same: an icon, its own window, and offline use.

### How installed copies get updates

An installed app loads the same files from `/sizing`, so it updates itself:

- When it opens with a connection, it checks for a new `sw.js` `VERSION`.
- The new version downloads in the background and shows on the **next** launch.
- If the version isn't bumped, installed copies can keep old icons and their
  offline copy, so always bump `VERSION` (see "Editing the tool" below).

### Hiding or removing install

If the client doesn't want an install option:

- **To hide only the footer button,** delete this line in `index.html`:
  ```html
  <button id="installBtn" class="install" type="button" hidden>Install app</button>
  ```
  The script checks that the button exists, so nothing breaks. Browsers may
  still offer install from the address bar or menu.
- **To turn off installing completely,** also remove this line from the
  `<head>` of `index.html`:
  ```html
  <link rel="manifest" href="manifest.webmanifest">
  ```
  The tool still works offline in the browser, but it can no longer be
  installed as an app. Leave `sw.js` in place.
- **To also turn off offline use,** remove the second `<script>` block at the
  bottom of `index.html`, the one that registers `sw.js`. Ask a developer to
  replace `sw.js` with a small "unregister" version rather than deleting it.
  That clears the copy already on visitors' devices.

For the first two options, bump `VERSION` in `sw.js` and deploy as described
below.

---

## Files

They live in the website repository, in `statamic/public/sizing/`:

| File | Purpose |
| --- | --- |
| `index.html` | The whole app: layout, styles, data, logic and embedded logos |
| `sw.js` | Service worker (offline caching). Holds the `VERSION` number |
| `manifest.webmanifest` | Install details (name, colours, icons) |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon-180.png`, `favicon-32.png` | App and home-screen icons |

How the site serves it:

- **Tracked in git:** `statamic/public/` is mostly ignored, so `.gitignore` has
  an exception, `!statamic/public/sizing/`. Any file added to that folder is
  committed and deployed like the rest of the site.
- **URL:** the web server serves the files directly. `statamic/routes/web.php`
  also redirects `/sizing` and `/sizing/` to `/sizing/index.html`, because some
  servers (such as the local Caddy setup) don't serve a folder's `index.html`.
- The original logo PNGs from the client's zip aren't needed, because the
  logos are embedded in `index.html`.

---

## Editing the tool and publishing to the live site

### 1. Make the change locally

Edit the files in `statamic/public/sizing/`. Common edits:

- **Ratios, systems and span limits:** the `SYSTEMS` list near the top of the
  `<script>` in `index.html`. `r` is the span/depth range, and `smin`/`smax`
  is the span slider range in metres.
- **Load factors:** the `LOADS` list in the same script.
- **Email address:** `CONSTRUCTURE_EMAIL` in the same script.
- **Wording, disclaimer and reference cards:** the HTML in `index.html`.
- **Brand colours and font:** the CSS variables at the top of `index.html`
  (`--accent`, `--font` and so on).
- **Icons:** replace the four PNGs, keeping the same names and sizes.

### 2. Bump the version

Open `sw.js` and increase `VERSION`, for example:

```js
var VERSION='cst-sizing-v3';   // → 'cst-sizing-v4'
```

Do this **for every release**. Online visitors always load the latest
`index.html`, but the icons, the manifest and the offline or installed copy
stay cached until `VERSION` changes.

### 3. Check it locally

Open https://constructure.localhost:8454/sizing. To see the new version:

- In Chrome DevTools, go to **Application → Service workers** and press
  **Unregister**, or go to **Application → Storage** and press
  **Clear site data**. Then reload.
- Check the disclaimer, each material and system, the span slider, Save image
  and Email.

### 4. Commit and deploy

```bash
git add statamic/public/sizing statamic/routes/web.php
git commit -m "Sizing tool: <what changed>"
git push
```

Then deploy to production the usual way, for example `git pull` on the server.
These are static files, so you don't need to rebuild with npm, clear the
Statamic cache or run composer. If the server has a CDN or proxy cache, purge
`/sizing/*`.

### 5. Check the live site

1. Open https://<live-site>/sizing in a private or incognito window. It should
   show the new version straight away.
2. In a normal window, if you still see the old version, reload once or twice.
   The service worker picks up the new `VERSION` and switches over. If it
   still doesn't update, use DevTools **Clear site data** as in step 3.
3. **Installed app on a phone:** close it fully and reopen it, twice if needed.
   It updates in the background on the first launch and shows the new version
   on the next one.
4. Optional: in DevTools under **Application → Cache storage**, the cache name
   should match the new `VERSION`.

---

## The link on the Practice page

The link is content, not code, so it is managed in the Statamic control panel:

1. Go to **Collections → Pages → Practice**.
2. In the page builder, open the **Article** block where the link should appear
   (we suggest under Services, next to Feasibility Study).
3. In the text, add a **Buttons** set, and then **Add button**:
   - **Label:** for example "Try our indicative sizing tool"
   - Turn on **Show controls**, then set **Link type: URL** and **URL: `/sizing`**
   - **Open in new window:** optional. It's recommended, so visitors keep the
     Practice page open.
4. Save and publish.

To change the wording, move the button or remove the link, edit or delete
that button in the same place. The tool itself stays at `/sizing` either way.

---

## Still to tailor

- **Font:** the app loads Hanken Grotesk from Google Fonts as a stand-in. To use
  the brand font, self-host it in `statamic/public/sizing/` with `@font-face`
  so it also works offline, and update the `--font` variable in `index.html`.
- **App icon:** the home-screen icon is a placeholder blue I-beam, because the
  wordmark doesn't fit a square tile. Replace the four icon PNGs if a square
  brand mark becomes available.
