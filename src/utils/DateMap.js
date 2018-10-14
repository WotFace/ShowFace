function keyFromDate(dateKey) {
  return dateKey.valueOf();
}

// Subclass of Map that allows Date and Moment.js objects to be used as keys.
export default class DateMap extends Map {
  delete(dateKey) {
    if (!dateKey) return undefined;
    return super.delete(keyFromDate(dateKey));
  }

  get(dateKey) {
    if (!dateKey) return undefined;
    return super.get(keyFromDate(dateKey));
  }

  has(dateKey) {
    if (!dateKey) return undefined;
    return super.has(keyFromDate(dateKey));
  }

  set(dateKey, val) {
    if (!dateKey) return undefined;
    return super.set(keyFromDate(dateKey), val);
  }
}
