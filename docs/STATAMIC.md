# Statamic

[← Back to README](../README.md)

- [Installation](#installation)
- [Uploading Statamic to a repository](#uploading-statamic-to-a-repository)
- [Create collections](#create-collections)
- [Hierarchical taxonomies (workaround)](#hierarchical-taxonomies-in-statamic-workaround-guide)
- [Custom modifier: Color Name](#custom-modifier-color-name)
- [Add a favicon](#add-a-favicon)
- [Addons](#add-addons)
- [Clear cache and static files](#clear-cache-and-static-files)
- [Environment file](#environment-file)

---

## Installation

### Docker installation

[DOCKER.md](DOCKER.md)

#### Reload Docker locally (if needed)

```bash
# Quick reload after big changes
cd ~/Dockers/constructure
docker compose up -d --force-recreate
```

### Statamic installation

1. Run `docker compose exec app composer install`
2. Run `docker compose exec app php please make:user`
3. Run `docker compose exec node npm ci` && `docker compose exec node npm run build`

---

## Uploading Statamic to a repository

Use `composer create-project` **only once** to bootstrap a *new* app.
After that, treat your Statamic site like any other Laravel app: **commit the app**, and on new machines run `composer install`, not `create-project`.

You’ve got two solid ways to organize things:

### Option A: Commit the app (minus vendor)

Your repo is the Statamic/Laravel app itself.

**Commit (at minimum):**

* `composer.json`, `composer.lock`, `artisan`, `bootstrap/`, `config/`, `routes/`
* Statamic content & config: `content/`, `resources/blueprints/`, `resources/fieldsets/`, `resources/forms/`, `resources/users/`, `resources/views/`, `users/` (if file users), `public/.htaccess`
* Your env example: `.env.example`
* Docker files

**Ignore:**

* `vendor/`, `node_modules/`, `storage/framework/cache/*`, `public/build/` (unless you want to deploy built assets)
* Anything machine-specific

**Deploy / new staging steps (no overwrite):**

```bash
# clone repo
cp .env.example .env   # set APP_URL, etc.

docker compose up -d

# install deps (NO create-project)
docker compose exec -u root -e COMPOSER_ALLOW_SUPERUSER=1 app composer install --no-dev -o

# first time only
docker compose exec app php artisan key:generate

# build assets (or copy your prebuilt /public/build)
docker compose exec node npm ci
docker compose exec node npm run build
```

This way, your collections, taxonomies, blueprints, etc. are just files in git and **cannot** be overwritten by any installer.

### Option B: Keep a thin repo + bootstrap script (don’t overwrite)

If you really don’t want to commit the whole Laravel skeleton, keep Docker + your **overlay** (content/blueprints/etc.), and add a script that runs `create-project` **only if the directory is empty**, then copies your files on top.

Example bootstrap script (commit it as `scripts/bootstrap-statamic.sh`):

```bash
#!/usr/bin/env sh
set -e

# inside the app container
cd /var/www/html

if [ ! -f artisan ]; then
  # Empty dir → do the bootstrap once
  COMPOSER_ALLOW_SUPERUSER=1 composer create-project statamic/statamic . --no-interaction
fi

# Apply your overlay safely (won't clobber existing files)
# Assumes you mounted your overlay at /overlay in the container
rsync -av --ignore-existing /overlay/ /var/www/html/

# Install deps / build
COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev -o
php artisan key:generate || true
```

**Compose call:**

```bash
docker compose exec -u root app sh /var/www/html/scripts/bootstrap-statamic.sh
```

> Key bit: `--ignore-existing` ensures you don’t overwrite anything already present. You can also flip it around (copy first, then `composer install`) if you prefer.

### What not to do

* Don’t run `composer create-project` on an already-initialized app directory. It *will* try to lay down a fresh skeleton and can overwrite/complicate things.
* Don’t rely on `statamic:install` to build a project skeleton on every deploy; that’s for first-time setup/publishing assets, not for syncing your content model.

---

## Create collections

To add a **"Projects"** link to your **navigation menu** in Statamic, follow these steps:

### 1. Create a new collection "Projects"

- Create the **content** file `content/collections/projects.yaml` or use the CMS to create a new Collection
- Create the blueprint file `resources/blueprints/collections/projects/projects.yaml` or use the CMS to create a new Blueprint
- Create taxonomies if needed

### 2. Create an index page for "Projects"

Since a **Collection** doesn't automatically generate an index page, you need to create one:

1. **Go to** `resources/views/` and create a new template:
   ```
   resources/views/projects/index.antlers.html
   ```
2. **Add basic code** to display your projects:
   ```antlers
   {{ collection:projects }}
       <h2><a href="{{ url }}">{{ title }}</a></h2>
   {{ /collection }}
   ```
3. **Optional: Ensure a route exists** in `routes/web.php`:
   ```php
   Route::statamic('projects', 'projects.index', ['title' => 'Projects']);
   ```
   This makes `/projects` load the `projects/index.antlers.html` template.

### 3. Add "Projects" to navigation

#### Option 1: Using Statamic’s Navigation UI

1. **Go to** Statamic Control Panel → **Navigation**.
2. Click on the **Primary Navigation (or your nav set)**.
3. Click **"Add Item"** → Select **"Entry"**.
4. Choose **"Manual URL"** and enter `/projects` as the URL.
5. Set the **label** to `"Projects"`, then **Save**.

#### Option 2: Add it manually in your template

If you're manually rendering the navigation, modify your nav template (`resources/views/partials/navigation.antlers.html`):

```antlers
<ul>
    {{ nav from="main_navigation" }}
        <li><a href="{{ url }}">{{ title }}</a></li>
    {{ /nav }}
    <li><a href="/projects">Projects</a></li>  {# Manually add the Projects link #}
</ul>
```

---

## Hierarchical taxonomies in Statamic (workaround guide)

### The problem

Statamic does **not natively support hierarchical taxonomies**.

Even though you can define a `structure:` in a taxonomy's YAML file (e.g., `locations.yaml`), **this has no effect**. The Control Panel will not display a drag-and-drop UI for taxonomy terms like it does for structured collections (such as "Pages").

This is a known limitation, even with Statamic Pro.

### The workaround

To simulate hierarchy in a taxonomy (e.g., `Locations`), you can create a **manual parent-child relationship** using a `Taxonomy Terms` field.

#### 1. Update the taxonomy blueprint

1. Go to the `Locations` taxonomy blueprint (in the CP or `resources/blueprints/taxonomies/locations.yaml`).
2. Add a new field:
   - **Field Name:** `parent_location`
   - **Field Type:** `Taxonomy Terms`
   - **Taxonomy to Reference:** `locations` (yes, self-referencing)

This allows each term to optionally point to another term as its "parent".

#### 2. Organize terms manually

When editing a term (e.g., “London”), you can now select another term (e.g., “United Kingdom”) as its parent.

This manually builds a hierarchy.

#### 3. Displaying the hierarchy in templates

You can use Antlers logic to loop through parent terms and their children.

**Example (2 levels deep):**

```antlers
{{ taxonomy:locations }}
    {{ if no_parent_location }}
        <h2>{{ title }}</h2>

        {{ taxonomy:locations where="parent_location:id == {id}" }}
            <h3>– {{ title }}</h3>
        {{ /taxonomy:locations }}

    {{ /if }}
{{ /taxonomy:locations }}
```

You can extend this logic to support deeper nesting as needed.

---

## Custom modifier: Color Name

```bash
/app/Modifiers/ColorName.php
```

```php
{{ title_css = collapse_title_colour ? ('group-hover:text-'+ collapse_title_colour | color_name) : 'group-hover:text-neutral' }}
```

---

## Add a favicon

### Put your favicon in assets

In your project, add your favicon image (e.g., `favicon.png`) into an assets folder that Statamic knows about.

```bash
/public/favicons/favicon.png
```

Or if you use a different assets container, use that path instead.

### Use the modifier in your template

In the `<head>` section of your Antlers layout (e.g., `statamic/resources/views/layout.antlers.html`):

```antlers
{{ '/favicons/favicon.png' | favicon }}
```

This will output something like:

```html
<link rel="shortcut icon" type="image/x-icon" href="/favicons/favicon.png">
```

---

## Add addons

### Example: Install Statamic Tabs

```sh
composer require eminos/statamic-tabs
```

### Current addons

- [Tabs](https://statamic.com/addons/kiwikiwi/tabs)
- [Bard Text Color](https://statamic.com/addons/xndbogdan/Statamic-3-Bard-Text-Color)
- [Livewire for Antlers](https://statamic.com/addons/marcorieser/livewire), see [LIVEWIRE.md](LIVEWIRE.md)
- [Statamic Instagram](https://statamic.com/addons/marcorieser/statamic-instagram), see [INSTAGRAM.md](INSTAGRAM.md)

---

## Clear cache and static files

```bash
php please stache:clear
php please static:clear
php please cache:clear
php artisan cache:clear
```

Reference: [Statamic Cache](https://statamic.dev/static-caching#by-force)

---

## Environment file

### Local

Copy the `.env.example` file to `.env`.
