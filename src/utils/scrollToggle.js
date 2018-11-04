// Util functions to enable/disable mobile scroll
// Adapted from https://stackoverflow.com/a/4770179
function preventDefault(e) {
  e = e || window.event;
  // if (e.preventDefault) e.preventDefault();
  e.returnValue = false;
}

export function disableMobileScroll() {
  window.ontouchmove = preventDefault; // mobile
}

export function enableMobileScroll() {
  window.ontouchmove = null;
}
