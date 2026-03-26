import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';
import collapse from '@alpinejs/collapse'
import morph from '@alpinejs/morph'
//import persist from '@alpinejs/persist'
import focus from '@alpinejs/focus'
import intersect from '@alpinejs/intersect'
import 'focus-visible'


//Lottie
import lottie from 'lottie-web'
import { create } from '@lottiefiles/lottie-interactivity';

//Lenis
import Lenis from '@studio-freight/lenis'

//Custom Modules
import consoleHello from './modules/consoleHello';
import preloader from './modules/preloader';
import tinyslider from './modules/tinyslider';

// Global get CSRF token function (used by forms).
window.getToken = async () => {
    return await fetch('/!/statamic-peak-tools/dynamic-token/refresh')
        .then((res) => res.json())
        .then((data) => {
            return data.csrf_token
        })
        .catch((error) => {
            this.error = 'Something went wrong. Please try again later.'
        })
}

// Init Lottie
window.lottie = lottie
window.create = create

// Init Lenis
window.Lenis = Lenis

// Call Alpine.
//window.Alpine = Alpine
//Alpine.plugin([collapse, focus, morph, persist, intersect])
Alpine.plugin([collapse, focus, morph, intersect])
//Alpine.start()


// Call Livewire only in Livewire pages
if(document.querySelector('main').classList.contains('livewirepage')){
    Livewire.start()
}   



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