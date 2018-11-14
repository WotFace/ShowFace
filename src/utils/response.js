import _ from 'lodash';
import DateMap from './DateMap';
import { compareNullableStrings } from './string';

export function anonNameToId(anonName) {
  return `anon ${anonName}`;
}

export function respondentToEmailOrName(respondent) {
  if (!respondent) return undefined;
  const { anonymousName, user } = respondent;
  // Prefix anon so that no names can pretend to be a User email
  return user ? user.email : anonNameToId(anonymousName);
}

export function getRespondentName(respondent) {
  if (!respondent) return null;
  return respondent.user && respondent.user.name ? respondent.user.name : respondent.anonymousName;
}

export function getRespondentDisplayName(respondent) {
  if (!respondent) return null;
  const name = getRespondentName(respondent);
  if (name) return name;
  return respondent.user ? respondent.user.email : respondent.id;
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
export function partitionRespondentsAtTime(respondents, respondentsDict, time, hiddenUserIds) {
  const respondersAtTime = new Set(respondentsDict.get(time));
  return partitionRespondentsByAttendance(respondents, respondersAtTime, hiddenUserIds);
}

export function partitionRespondentsByAttendance(
  respondents,
  attendingResponderSet,
  hiddenUserIds,
) {
  const respondersRespondentsObj = _.zipObject(
    respondents.map(respondentToEmailOrName),
    respondents,
  );
  const responders = Object.keys(respondersRespondentsObj);

  const [hidden, nonHiddenResponders] = _.partition(responders, (r) => hiddenUserIds.has(r));
  const [attending, possiblyNotAttending] = attendingResponderSet
    ? _.partition(nonHiddenResponders, (r) => attendingResponderSet.has(r))
    : [[], nonHiddenResponders];
  // TODO: Partition possiblyNotAttending further into non-responses and not attendings
  const notAttending = possiblyNotAttending;
  return { hidden, attending, possiblyNotAttending, notAttending, respondersRespondentsObj };
}

// Sort respondents with names. No name respondents are moved to the bottom and
// sorted by email. Respondents without emails are sorted by ID as a last
// resort.
// TODO: Sort logged in users to the top.
// TODO: Consider sorting key respondents to the top.
export function sortedRespondents(respondents) {
  const sorted = [...respondents];
  sorted.sort((a, b) => {
    const aName = getRespondentName(a);
    const bName = getRespondentName(b);
    const nameCompareRes = compareNullableStrings(aName, bName);
    if (nameCompareRes !== null) return nameCompareRes;

    // Both users have no names. Try comparing by email.
    const aEmail = a.user ? a.user.email : null;
    const bEmail = b.user ? b.user.email : null;
    const emailCompareRes = compareNullableStrings(aEmail, bEmail);
    if (emailCompareRes !== null) return emailCompareRes;

    // No name and no email. Just compare IDs so that the respondents are at least in some constant order.
    return a.id.localeCompare(b.id);
  });
  return sorted;
}
