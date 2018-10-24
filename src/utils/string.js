export function cleanName(name) {
  return name
    .trim()
    .replace(/\s/g, ' ') // Replace all whitespaces with spaces
    .replace(/  +/g, ' '); // Replace >=2 adj spaces with a single space
}
