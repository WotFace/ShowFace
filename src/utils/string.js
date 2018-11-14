export function cleanName(name) {
  return name
    .trim()
    .replace(/\s/g, ' ') // Replace all whitespaces with spaces
    .replace(/  +/g, ' '); // Replace >=2 adj spaces with a single space
}

// Sorts non-falsy strings, and bring them to the top. Returns null if both
// strings are falsy.
export function compareNullableStrings(a, b) {
  if (a && b) return a.toLowerCase().localeCompare(b.toLowerCase());
  if (!a && b) return 1; // put b on top if it exists
  if (a && !b) return -1; // put a on top if it exists
  return null;
}
