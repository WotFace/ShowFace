// Code in this file will be appended to the generated service worker by
// https://github.com/bbhlondon/cra-append-sw.

// Disable lint warnings for use of global self.
/* eslint-disable no-restricted-globals */

// Source: https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
self.addEventListener('message', (event) => {
  if (!event.data) {
    return;
  }

  switch (event.data) {
    case 'skipWaiting':
      self.skipWaiting();
      break;
    default:
      // NOOP
      break;
  }
});
