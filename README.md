# Constructure

A Statamic website for [Constructure](https://beta.constructure.tm-studio.co.uk/) based in [Statamic Starter Kit](https://github.com/pablorica/statamic_starter_kit) . It is containerized with Docker for consistent local development and easy deployment to any environment.


[![version](https://img.shields.io/badge/version-0.6.1-pink.svg)](https://semver.org)



## Production

[Not ready yet](https://beta.constructure.tm-studio.co.uk/)



## Staging Version

[https://beta.constructure.tm-studio.co.uk/](https://beta.constructure.tm-studio.co.uk/)

- login: constructure
- pwd: tmstudio

### Staging `public` folder

[https://beta.constructure.tm-studio.co.uk/public.tar.gz](https://beta.constructure.tm-studio.co.uk/public.tar.gz)

```bash
wget --user constructure --password tmstudio https://beta.constructure.tm-studio.co.uk/public.tar.gz
```

### Staging `content` folder

[https://beta.constructure.tm-studio.co.uk/content.tar.gz](https://beta.constructure.tm-studio.co.uk/content.tar.gz)

```bash
wget --user constructure --password tmstudio https://beta.constructure.tm-studio.co.uk/content.tar.gz
```

## Installation instructions

### Docker Installation

[DOCKER.md](https://github.com/TsevdosMcNeil/constructure/blob/main/DOCKER.md)

#### Reload Docker locally (if needed)

```bash
# Quick reload after big changes
cd ~/Dockers/constructure
docker compose up -d --force-recreate
```

### Statamic Installation

1. run `docker compose exec app composer install`
2. run `docker compose exec app php please make:user`
3. run `docker compose exec node npm ci` && `docker compose exec node npm run build`

---


## Uploading statamic to a repository

Use `composer create-project` **only once** to bootstrap a *new* app.
After that, treat your Statamic site like any other Laravel app: **commit the app**, and on new machines run `composer install`, not `create-project`.

You’ve got two solid ways to organize things:

---

## Option  Commit the app (minus vendor)

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


## Option B: Keep a thin repo + bootstrap script (don’t overwrite)

If you really don’t want to commit the whole Laravel skeleton, keep Docker + your **overlay** (content/blueprints/etc.), and add a script that runs `create-project` **only if the directory is empty** — then copies your files on top.

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

* Don’t run `composer create-project` on an already-initialized app directory — it *will* try to lay down a fresh skeleton and can overwrite/complicate things.
* Don’t rely on `statamic:install` to build a project skeleton on every deploy; that’s for first-time setup/publishing assets, not for syncing your content model.


---

## Compilation errors

### Vite Error

If there is a Vite Error when running
```bash
➜  npm run build

> build
> vite build

failed to load config from /var/www/html/vite.config.js
error during build:
TypeError: Cannot read properties of undefined (reading 'startsWith')
```

**Solution**

It can be due a wrong value in .env
`APP_URL="http://wrongsite.co.uk"`

Or a wrong hot file in public, in that case delete it
```bash
docker compose exec app rm -f public/hot
```



---

## Tailwind Configuration

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

The new CSS-first configuration lets you do just about everything you could do in your tailwind.config.js file, including configuring your design tokens, defining custom utilities and variants, and more.

To learn more about how it all works, read the new [theme variables documentation](https://tailwindcss.com/docs/theme).

However, you can still create a file similar to `tailwind.config.js` file if you need custom configurations.


### Manually Add a `tailwind.site.js` File

If you need to customize Tailwind (e.g., extend plugins), you can still create a **`js`** file.


   ```sh
   touch resources/js/tailwind.site.js
   ```

2. **Edit `tailwind.config.js`** to ensure Tailwind scans your Statamic views and JS files:
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
3. Import the file in the CSS file `resources/css/site.css`:
```css
@config '../js/tailwind.site.js';
...
   ```

4. Restart Vite:

```sh
docker compose exec node npm run dev
```

---

## Responsive Breakpoints

| Breakpoint | Min Width | Usage Example    |
| ---------- | --------- | ---------------- |
| `xs`       | 0         | `text-lg`        |
| `sm`       | 640px     | `sm:text-lg`     |
| `md`       | 768px     | `md:grid-cols-2` |
| `lg`       | 1024px    | `lg:flex`        |
| `xl`       | 1280px    | `xl:p-8`         |
| `2xl`      | 1536px    | `2xl:text-2xl`   |
| `3xl`      | 1700px    | `3xl:hidden`     |
| `4xl`      | 1920px    | `4xl:border-top` |

*These can be customized in the `statamic/resources/css/site.css` file if needed.*

---

## Add JS Libraries

### 1. Example: Install Tiny Slider

```sh
npm install tiny-slider
```

### 2. Add custom JS

Edit `resources/js/site.js`

```js
...
import tinyslider from './modules/tinyslider';
...

// Call custom modules.
const CDG = {

    onreadyFunctions: function() {
        //consoleHello('CDG is ready');
        //preloader();
        tinyslider();

        window.addEventListener("resize", function(){
            //consoleHello('window has resized');
            if(window.innerWidth < 768){
                //consoleHello('narrow');
            }
            else{
                //consoleHello('wide');
            }
         });
    },

    onloadFunctions: function() {
        //consoleHello('CDG is loaded');
    }
};

CDG.onreadyFunctions();

window.onload = function(event) {
    CDG.onloadFunctions();
};

```

---

## Create Collections

To add a **"Projects"** link to your **navigation menu** in Statamic, follow these steps:

### 1. Create a new collection "Projects"

 - Create the **content** file `content/collections/projects.yaml` or use the CMS to create a new Collection

 - Create the blueprint file `resources/blueprints/collections/projects/projects.yaml` or use the CMS to create a new Blueprint

 - Create taxonomies if needed

### 2. Create an Index Page for "Projects"

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
   - This makes `/projects` load the `projects/index.antlers.html` template.



### 3. Add "Projects" to Navigation

#### **Option 1: Using Statamic’s Navigation UI**
1. **Go to** Statamic Control Panel → **Navigation**.
2. Click on the **Primary Navigation (or your nav set)**.
3. Click **"Add Item"** → Select **"Entry"**.
4. Choose **"Manual URL"** and enter `/projects` as the URL.
5. Set the **label** to `"Projects"`, then **Save**.

#### **Option 2: Add It Manually in Your Template**
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

## Add Livewire

We will use [Livewire for Antlers](https://statamic.com/addons/marcorieser/livewire), a third-party Laravel Livewire integration for Statamic.

### Installation

Pull in the Livewire package with composer

```sh
composer require marcorieser/statamic-livewire
```


### Create a livewire component

Run the following command to generate a new Livewire component called counter.

```sh
php artisan make:livewire hello

 COMPONENT CREATED  🤙

CLASS: app/Livewire/Hello.php
VIEW:  resources/views/livewire/hello.blade.php

  _._
/ /o\ \   || ()                ()  __         
|_\ /_|   || || \\// /_\ \\ // || |~~ /_\   
 |`|`|    || ||  \/  \\_  \^/  || ||  \\_   


Congratulations, you've created your first Livewire component! 🎉🎉🎉
```

Note that we are not using `php please` here, becasue `please` is merely an alias for `php artisan statamic` and *Livewire* is outside *Statamic*.

Running this command will generate the following two files:

- `app/Http/Livewire/Hello.php`
- `resources/views/livewire/hello.blade.php`

Rename your template to `hello.antlers.html`, use Antlers syntax and do wathever you like. No need to change anything inside your component 



### Manually including Livewire's frontend assets

By default, Livewire injects the JavaScript and CSS assets it needs into each page that includes a Livewire component. If you want more control over this behavior, you can manually include the assets on a page using the following Antlers tags or Blade directives:

```html
<html>
    <head>
        <!-- If using Antlers -->
        {{ livewire:styles }}
 
        <!-- If using Blade -->
        @livewireStyles
    </head>
    <body>
 
        ...
        <!-- If using Antlers -->
        {{ livewire:scripts }}
 
        <!-- Blade -->
        @livewireScripts
    </body>
</html>
```

### Manually bundling Livewire and Alpine

If you need to include some custom Alpine plugins, you need to manually bundle the Livewire and Alpine assets and disable the automatic injection by using the following Antlers tag or Blade directive. Do not forget to include the Livewire styles as well.

So we need to inform Livewire that we want to use the ESM (ECMAScript module) version ourselves and prevent the injection of the livewire.js script tag. To achieve this, we must add the `{{ livewire:scriptConfig }}` directive to our layout files, instead of `{{ livewire:scripts }}`.

```html
<html>
    <head>
        <!-- If using Antlers -->
        {{ livewire:styles }}
 
        <!-- If using Blade -->
        @livewireStyles
    </head>
    <body>
        <main class="livewirepage">
            ...
        </main>
        <!-- If using Antlers -->
        {{ livewire:scriptConfig }}
 
        <!-- Blade -->
        @livewireScriptConfig
    </body>
</html>
```
*(do not forget to add the class `livewirepage` to the main tag)*


#### Update the app.js file

Then we need to import Alpine and Livewire in our app.js file, allowing us to register any custom resources, and ultimately starting Livewire and Alpine:
That means, instead of
    
```javascript
import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import morph from '@alpinejs/morph'
import persist from '@alpinejs/persist'
import focus from '@alpinejs/focus'
import intersect from '@alpinejs/intersect'

// Call Alpine.
window.Alpine = Alpine
Alpine.plugin([collapse, focus, morph, persist, intersect])
Alpine.start()
```

We will write

```javascript
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';
import collapse from '@alpinejs/collapse'
import morph from '@alpinejs/morph'
import focus from '@alpinejs/focus'
import intersect from '@alpinejs/intersect'

// Load Alpine.
Alpine.plugin([collapse, focus, morph, intersect])

// Call Livewire only in Livewire pages
if(document.querySelector('main').classList.contains('livewirepage')){
    Livewire.start()
}  
```

Note that the call `import persist from '@alpinejs/persist'` is not longer necessary, because it is already included in the Livewire package.

#### Update the package.json file

Remove the following lines from the package.json file, we don't need them anymore becasue these libraries are already included in the Livewire package.

```json
"@alpinejs/persist": "^3.12.3",
"alpinejs": "^3.12.3",
```

Use these commands to do that:

```bash
npm uninstall alpinejs --save
npm uninstall @alpinejs/persist --save
```

And compile files again:

```bash
npm install
```


### Error: Unable to find component: [livewire-component]

The error `Unable to find component: [component]` suggests that Livewire can't find a registered component named `component`.



#### **Checklist to troubleshoot:**

1. **Livewire Component PHP Class Missing?**
   Livewire components are *not* just the Antlers view files — they also need a matching **PHP class**.

   Since `hello` works, you probably have something like:
   ```php
   // app/Http/Livewire/Hello.php
   namespace App\Http\Livewire;

   use Livewire\Component;

   class Hello extends Component
   {
       public function render()
       {
           return view('livewire.hello');
       }
   }
   ```

   **Do you also have this for `Component`?** You’ll need:

   ```php
   // app/Http/Livewire/Bye.php
   namespace App\Http\Livewire;

   use Livewire\Component;

   class Component extends Component
   {
       public function render()
       {
           return view('livewire.component');
       }
   }
   ```

   If this class is missing, Livewire won’t recognize the component and will throw the error you're seeing.


2. **File naming & class match**
   Livewire uses naming conventions. Make sure:
   - Class name is `Bye`
   - File is `Bye.php`
   - Inside `App\Http\Livewire` (unless you've customized Livewire's namespace)


3. **Cached views or config?**
   After creating a new component, it sometimes helps to run:

   ```bash
   php artisan livewire:discover
   php artisan optimize:clear
   ```

   Especially if you're using auto-discovery or caching.

---

### Hierarchical Taxonomies in Statamic (Workaround Guide)

#### The Problem

Statamic does **not natively support hierarchical taxonomies**.

Even though you can define a `structure:` in a taxonomy's YAML file (e.g., `locations.yaml`), **this has no effect**. The Control Panel will not display a drag-and-drop UI for taxonomy terms like it does for structured collections (such as "Pages").

This is a known limitation — even with Statamic Pro.

#### The Workaround

To simulate hierarchy in a taxonomy (e.g., `Locations`), you can create a **manual parent-child relationship** using a `Taxonomy Terms` field.

##### 1. Update the Taxonomy Blueprint

1. Go to the `Locations` taxonomy blueprint (in the CP or `resources/blueprints/taxonomies/locations.yaml`).
2. Add a new field:

   - **Field Name:** `parent_location`
   - **Field Type:** `Taxonomy Terms`
   - **Taxonomy to Reference:** `locations` (yes, self-referencing)

This allows each term to optionally point to another term as its "parent".


##### 2. Organize Terms Manually

When editing a term (e.g., “London”), you can now select another term (e.g., “United Kingdom”) as its parent.

This manually builds a hierarchy.


##### 3. Displaying the Hierarchy in Templates

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

## Custom Modifier: Color Name

 ```bash
/app/Modifiers/ColorName.php
 ```
```php
{{ title_css = collapse_title_colour ? ('group-hover:text-'+ collapse_title_colour | color_name) : 'group-hover:text-neutral' }}
```

---

## Add a Favicon

### Put your favicon in assets

In your project, add your favicon image (e.g., favicon.png) into an assets folder that Statamic knows about.

 ```bash
/public/favicons/favicon.png
 ```

Or if you use a different assets container, use that path instead.


### Use the modifier in your template

In your <head> section of your Antlers layout (e.g., `statamic/resources/views/layout.antlers.html`):

```antlers
{{ '/favicons/favicon.png' | favicon }}
 ```

This will output something like:

```html
<link rel="shortcut icon" type="image/x-icon" href="/assets/img/favicon.png">
 ```


---

## Add Addons

### Example: Install Statamic Tabs

```sh
composer require eminos/statamic-tabs
```

### Current Addons

- [Tabs](https://statamic.com/addons/kiwikiwi/tabs)
- [Bard Text Color](https://statamic.com/addons/xndbogdan/Statamic-3-Bard-Text-Color)

---

## Additional commands

### Clear cache and static files

```bash
php please stache:clear
php please static:clear
php please cache:clear
php artisan cache:clear
```
Reference to [Statamic Cache](https://statamic.dev/static-caching#by-force)


## Environment file contents


### Local

Copy the `.env.example` file to `.env`



---

## Instagram

[Statamic Instagram Plugin](https://statamic.com/addons/marcorieser/statamic-instagram)

This new plugin will replace the old one `nineteensquared/instagram`, which has been abandoned.

### Features

- Fetch Instagram posts via Meta's Instagram Business API  
- Auto-refreshing of Access Tokens  


### How to Install

First, remove the old package:

```bash
composer remove nineteensquared/instagram
```

Then, install the new one:

```bash
composer require marcorieser/statamic-instagram
...
Using version ^2.0 for marcorieser/statamic-instagram
```


### How to Use

#### Installation Steps

1. Install the addon  
2. Publish the addon config by running:  

   ```bash
   php artisan vendor:publish --tag=statamic-instagram-config
   ```

3. A new file `config/statamic-instagram.php` will be created  
4. Add your Access Token to the account section in the published config file  

```php
return [
    'limit' => 12,

    'include_child_posts' => false,

    'cache' => [
        'key_prefix' => 'instagram',
        'duration' => 60 * 60 * 24, // 1 day
    ],

    'accounts' => [
        [
            'handle' => 'default',
            'access_token' => 'YOUR TOKEN HERE',
        ],
    ]
];
```

If you do not have a token, follow the instructions below.


### Creating a Meta App / Access Token

Create an Access Token for the API with these steps:

1. Log in with your Instagram credentials at [Facebook Developers](https://developers.facebook.com)  
2. Create a new app (choose **Other** as the use case and **Business** as the app type)  
3. Add **Instagram** as a product to your app  
4. Link your Instagram account at **Generate access tokens** in the API setup with the Instagram login section of your app  
5. Generate a token and add it to the config in Statamic  

Further information is available in [Meta's documentation](https://developers.facebook.com/docs/).



### Display the Feed

You can use the `{{ instagram:feed }}` tag to fetch media from the API and return them as an array.


---


## Acknowledgements

* [Statamic Starter Kit](https://github.com/pablorica/statamic_starter_kit)
* [Statamic Peak](https://statamic.com/starter-kits/studio1902/peak)

## Copyright and License

Copyright 2025 Constructure website released under the [MIT](https://github.com/TsevdosMcNeil/constructure/blob/main/LICENSE) license.

## Versioning

We use [SemVer](https://semver.org/) for versioning.

### Changelog

[CHANGELOG.md](https://github.com/TsevdosMcNeil/constructure/blob/main/CHANGELOG.md)
