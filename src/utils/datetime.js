import _ from 'lodash';
import moment from 'moment';

// TODO: Nice to have: replace moment with something else
export function datesFromRange(startDateStr, endDateStr) {
  const startDateSec = new Date(startDateStr).getTime();
  const endDateSec = new Date(endDateStr).getTime();
  const timestamps = _.range(startDateSec, endDateSec, 86400000); // 86,400,000 = no. ms in a day
  timestamps.push(endDateSec); // As _.range excludes endDate, we need to add it back
  return timestamps.map((timestamp) => moment(timestamp));
}
