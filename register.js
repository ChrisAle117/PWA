// register.js - Script para registrar el Service Worker

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                console.log('Service Worker registrado con éxito:', registration);
            })
            .catch(function(error) {
                console.log('Error al registrar el Service Worker:', error);
            });
    });
}