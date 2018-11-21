// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read http://bit.ly/CRA-PWA

// Large parts of this file are copied from NUSMods.
// https://github.com/nusmodifications/nusmods/blob/bd2b9d632c0476b1065c4a86e40f0616892dddf2/www/src/js/bootstrapping/service-worker.js

let currentRegistration;
function getRegistration() {
  return currentRegistration;
}

// Source: https://github.com/nusmodifications/nusmods/pull/1047/files#diff-9d6bd6e0b057775fc0d2e9603db2b5f5R33
export function updateServiceWorker() {
  const registration = getRegistration();
  // Ensure registration.waiting is available before calling postMessage()
  if (!registration || !registration.waiting) return;
  registration.waiting.postMessage('skipWaiting');
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/),
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit http://bit.ly/CRA-PWA',
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

// Code taken from https://developers.google.com/web/tools/workbox/guides/advanced-recipes
function onNewServiceWorker(registration, callback) {
  if (registration.waiting) {
    // SW is waiting to activate. Can occur if multiple clients open and
    // one of the clients is refreshed.
    callback();
    return;
  }
  const listenInstalledStateChange = () => {
    if (!registration.installing) {
      return;
    }
    registration.installing.addEventListener('statechange', (event) => {
      if (event.target.state === 'installed') {
        // A new service worker is available, inform the user
        callback();
      }
    });
  };
  if (registration.installing) {
    listenInstalledStateChange();
  } else {
    // We are currently controlled so a new SW may be found...
    // Add a listener in case a new SW is found,
    registration.addEventListener('updatefound', listenInstalledStateChange);
  }
}

function registerValidSW(swUrl, config) {
  const { serviceWorker } = navigator;
  if (!serviceWorker) {
    return;
  }

  serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Track updates to the Service Worker.
      if (!serviceWorker.controller) {
        // The window client isn't currently controlled so it's a new service
        // worker that will activate immediately
        return;
      }

      // Refresh the service worker regularly so that the user gets the update
      // notice if they leave the tab open for a while
      const updateIntervalId = window.setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      // When the user asks to refresh the UI, we'll need to reload the window
      let preventDevToolsReloadLoop;
      serviceWorker.addEventListener('controllerchange', () => {
        // Ensure refresh is only called once - This works around a bug in "force update on reload".
        if (preventDevToolsReloadLoop) return;
        preventDevToolsReloadLoop = true;
        window.location.reload();
      });

      onNewServiceWorker(registration, () => {
        currentRegistration = registration;
        // Execute callback
        if (config && config.onUpdate) {
          config.onUpdate(registration);
        }
        window.clearInterval(updateIntervalId);
      });
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl)
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
