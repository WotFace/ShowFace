import _ from 'lodash';
import DateMap from './DateMap';

export function anonNameToId(anonName) {
  return `anon ${anonName}`;
}

export function respondentToEmailOrName(respondent) {
  if (!respondent) return undefined;
  const { anonymousName, user } = respondent;
  // Prefix anon so that no names can pretend to be a User email
  return user ? user.email : anonNameToId(anonymousName);
}

// Shape of returned Map: { startTime: [User email or anonymousName] }
export function respondentsToDict(respondents) {
  const hm = new DateMap();
  respondents.forEach((respondent) => {
    const { response } = respondent;
    const responder = respondentToEmailOrName(respondent);
    response.forEach((dateStr) => {
      const date = new Date(dateStr);
      if (hm.has(date)) {
        hm.get(date).add(responder);
      } else {
        hm.set(date, new Set([responder]));
      }
    });
  });
  return hm;
}

/**
 * Partitions respondents into those who can and cannot make it at time, and in
 * the future, those who have not responded.
 *
 * In this function, we define a Responder as a User's email or anonymous name
 * as returned by anonNameToId.
 *
 * @param {Respondent[]} respondents - A poll's Respondents.
 * @param {DateMap} respondentsDict - A mapping of start times to Responders.
 * @param {Date} time - Respondents will be partitioned by this time.
 * @return An object with 4 keys. 3 of those keys, `attending`,
 * `possiblyNotAttending`, and `notAttending`, point to Responder arrays. The
 * last key, `respondersRespondentsObj`, points to an object associating
 * Responders with Respondents.
 */
export function partitionRespondentsByAttendance(respondents, respondentsDict, time) {
  const respondersRespondentsObj = _.zipObject(
    respondents.map(respondentToEmailOrName),
    respondents,
  );
  const responders = Object.keys(respondersRespondentsObj);
  const respondersAtTime = new Set(respondentsDict.get(time));

  const [attending, possiblyNotAttending] = _.partition(responders, (r) => respondersAtTime.has(r));
  // TODO: Partition possiblyNotAttending further into non-responses and not attendings
  const notAttending = possiblyNotAttending;
  return { attending, possiblyNotAttending, notAttending, respondersRespondentsObj };
}
