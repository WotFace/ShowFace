import responseToDict from './response';

/* TODO: add proper assert */
it('responseToDict works', () => {
  function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
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

  const responses = {
    el: [...generateInterval(now, 60), ...generateInterval(addMinutes(now, 120), 120)],
    jk: [...generateInterval(now, 15), ...generateInterval(addMinutes(now, 30), 15)],
    ua: [...generateInterval(now, 15), ...generateInterval(addMinutes(now, 30), 120)],
  };
  console.log(responseToDict(responses));
});
