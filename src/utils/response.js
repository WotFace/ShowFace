import moment from 'moment';

const responseToDict = (responses) => {
  const m = {};
  for (var name in responses) {
    const timings = responses[name];
    for (var i in timings) {
      const mtiming = moment(timings[i]);
      if (!m[mtiming]) {
        m[mtiming] = [name];
      } else {
        m[mtiming].push(name);
      }
    }
  }
  return m;
};

export default responseToDict;
