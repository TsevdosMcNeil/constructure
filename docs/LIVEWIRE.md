# Livewire

[← Back to README](../README.md)

We use [Livewire for Antlers](https://statamic.com/addons/marcorieser/livewire), a third-party Laravel Livewire integration for Statamic.

> The Projects filters no longer use Livewire; they use plain Alpine. See [ALPINE.md](ALPINE.md).

- [Installation](#installation)
- [Create a Livewire component](#create-a-livewire-component)
- [Manually including Livewire's frontend assets](#manually-including-livewires-frontend-assets)
- [Manually bundling Livewire and Alpine](#manually-bundling-livewire-and-alpine)
- [Error: Unable to find component](#error-unable-to-find-component-livewire-component)

---

## Installation

Pull in the Livewire package with Composer:

```sh
composer require marcorieser/statamic-livewire
```

---

## Create a Livewire component

Run the following command to generate a new Livewire component called `hello`.

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

Note that we are not using `php please` here, because `please` is merely an alias for `php artisan statamic` and *Livewire* is outside *Statamic*.

Running this command will generate the following two files:

- `app/Livewire/Hello.php`
- `resources/views/livewire/hello.blade.php`

Rename your template to `hello.antlers.html`, use Antlers syntax and do whatever you like. No need to change anything inside your component.

---

## Manually including Livewire's frontend assets

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
 
        <!-- If using Blade -->
        @livewireScripts
    </body>
</html>
```

---

## Manually bundling Livewire and Alpine

If you need to include some custom Alpine plugins, you need to manually bundle the Livewire and Alpine assets and disable the automatic injection by using the following Antlers tag or Blade directive. Do not forget to include the Livewire styles as well.

So we need to inform Livewire that we want to use the ESM (ECMAScript module) version ourselves and prevent the injection of the `livewire.js` script tag. To achieve this, we must add the `{{ livewire:scriptConfig }}` directive to our layout files, instead of `{{ livewire:scripts }}`.

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
 
        <!-- If using Blade -->
        @livewireScriptConfig
    </body>
</html>
```

*(Do not forget to add the class `livewirepage` to the main tag.)*

### Update the app.js file

Then we need to import Alpine and Livewire in our `app.js` file, allowing us to register any custom resources, and ultimately starting Livewire and Alpine.

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

we will write

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

Note that `import persist from '@alpinejs/persist'` is no longer necessary, because it is already included in the Livewire package.

### Update the package.json file

Remove the following lines from the `package.json` file. We don't need them anymore because these libraries are already included in the Livewire package.

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

---

## Error: Unable to find component: [livewire-component]

The error `Unable to find component: [component]` suggests that Livewire can't find a registered component with that name. The checklist below uses a component called `bye` as an example.

### Checklist to troubleshoot

1. **Livewire component PHP class missing?**
   Livewire components are *not* just the Antlers view files. They also need a matching **PHP class**.

   Since `hello` works, you probably have something like:
   ```php
   // app/Livewire/Hello.php
   namespace App\Livewire;

   use Livewire\Component;

   class Hello extends Component
   {
       public function render()
       {
           return view('livewire.hello');
       }
   }
   ```

   **Do you also have this for `bye`?** You’ll need:

   ```php
   // app/Livewire/Bye.php
   namespace App\Livewire;

   use Livewire\Component;

   class Bye extends Component
   {
       public function render()
       {
           return view('livewire.bye');
       }
   }
   ```

   If this class is missing, Livewire won’t recognize the component and will throw the error you're seeing.

2. **File naming & class match**
   Livewire uses naming conventions. Make sure:
   - Class name is `Bye`
   - File is `Bye.php`
   - Inside `App\Livewire` (unless you've customized Livewire's namespace)

3. **Cached views or config?**
   After creating a new component, it sometimes helps to run:

   ```bash
   php artisan livewire:discover
   php artisan optimize:clear
   ```

   Especially if you're using auto-discovery or caching.
