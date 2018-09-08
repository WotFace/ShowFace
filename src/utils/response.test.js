import responseToDict from './response';
import { firestore } from 'firebase';

/* TODO: add proper assert */
it('responseToDict works', () => {
  function addMinutes(date, minutes) {
    return firestore.Timestamp.fromDate(new Date(date.getTime() + minutes * 60000));
  }

  function generateInterval(date, minutes) {
    var count = minutes / 15;
    var timestamps = [];
    for (var i = 0; i < count; i++) {
      timestamps.push(addMinutes(date, 15 * i));
    }
    return timestamps;
  }

  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60000);

  const responses = {
    el: [...generateInterval(now, 60), ...generateInterval(later, 120)],
    jk: [...generateInterval(now, 15), ...generateInterval(later, 15)],
    ua: [...generateInterval(now, 15), ...generateInterval(later, 120)],
  };
  console.log(responseToDict(responses));
});
