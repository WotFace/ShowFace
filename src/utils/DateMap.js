function keyFromDate(dateKey) {
  return dateKey.valueOf();
}

// Subclass of Map that allows Date and Moment.js objects to be used as keys.
export default class DateMap extends Map {
  delete(dateKey) {
    return super.delete(keyFromDate(dateKey));
  }

  get(dateKey) {
    return super.get(keyFromDate(dateKey));
  }

  has(dateKey) {
    return super.has(keyFromDate(dateKey));
  }

  set(dateKey, val) {
    return super.set(keyFromDate(dateKey), val);
  }
}
