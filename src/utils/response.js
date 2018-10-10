import _ from 'lodash';
import DateMap from './DateMap';

const responsesToDict = (responses) => {
  responses = _.mapValues(responses, (v) => _.map(v, (dt) => dt.toDate()));
  const hm = new DateMap();
  Object.entries(responses).forEach(([name, dates]) => {
    dates.forEach((date) => {
      if (hm.has(date)) {
        hm.get(date).add(name);
      } else {
        hm.set(date, new Set([name]));
      }
    });
  });
  return hm;
};

export default responsesToDict;
