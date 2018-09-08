import moment from 'moment';
import _ from 'lodash';

const responseToDict = (responses) => {
  responses = _.mapValues(responses, (v) => _.map(v, (dt) => dt.toDate()));
  return _.reduce(
    responses,
    (hm, dates, name) => {
      _.forEach(dates, (date) => {
        if (hm[date]) {
          hm[date].add(name);
        } else {
          hm[date] = new Set([name]);
        }
      });
      return hm;
    },
    {},
  );
};

export default responseToDict;
