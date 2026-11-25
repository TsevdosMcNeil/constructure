# Alpine.js and JS libraries

[← Back to README](../README.md)

- [Alpine on this site](#alpine-on-this-site)
- [Add JS libraries](#add-js-libraries)

---

## Alpine on this site

Alpine is loaded from Livewire's ESM bundle in `resources/js/site.js` (see [Manually bundling Livewire and Alpine](LIVEWIRE.md#manually-bundling-livewire-and-alpine)). `Livewire.start()`, which also starts Alpine, is only called when the `<main>` tag has the class `livewirepage`, so keep that class on any page that relies on Alpine.

The Projects filters (sectors, expertises) use plain Alpine, filtering client-side in `resources/views/projects/_listing.antlers.html`. They no longer use a Livewire component.

---

## Add JS libraries

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
