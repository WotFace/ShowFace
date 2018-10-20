import _ from 'lodash';

export function datesFromRange(startDateStr, endDateStr) {
  const startDateSec = new Date(startDateStr).getTime();
  const endDateSec = new Date(endDateStr).getTime();
  const timestamps = _.range(startDateSec, endDateSec, 86400000); // 86,400,000 = no. ms in a day
  timestamps.push(endDateSec); // As _.range excludes endDate, we need to add it back
  return timestamps.map((timestamp) => new Date(timestamp));
}

function datifiedEntity(entity, varKeys = [], arrKeys = []) {
  if (!entity) return entity;

  const datifiedEntity = { ...entity };
  for (let key of varKeys) {
    const val = datifiedEntity[key];
    if (val) datifiedEntity[key] = new Date(val);
  }

  for (let key of arrKeys) {
    const vals = datifiedEntity[key];
    if (vals) datifiedEntity[key] = vals.map((val) => new Date(val));
  }

  return datifiedEntity;
}

export function datifyShowResponse(result, path) {
  const show = _.get(result, path);
  if (!show) return result;

  const valKeys = ['startTime', 'endjime'];
  const arrKeys = ['dates'];
  const datifiedShow = datifiedEntity(show, valKeys, arrKeys);
  // datifiedShow.respondents = datifiedShow.respondents.map((r) => datifiedEntity(r, ['updatedAt']));
  return _.set(result, path, datifiedShow);
}
