import moment from 'moment';
import _ from 'lodash';

const responseToDict = (responses) => {
  responses = _.mapValues(responses, (v) => _.map(v, (dt) => dt.toDate()));
  const m = {};
  for (var name in responses) {
    const timings = responses[name];
    for (var i in timings) {
      const mtiming = timings[i];
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
