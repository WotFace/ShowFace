import DateMap from './DateMap';

export function anonNameToId(anonName) {
  return `anon ${anonName}`;
}

export function respondentToUserIdOrName(respondent) {
  if (!respondent) return undefined;
  const { anonymousName, user } = respondent;
  // Prefix anon so that no names can pretend to be a User id
  return user ? user.id : anonNameToId(anonymousName);
}

// Shape of returned Map: { startTime: [User ID or anonymousName] }
export function respondentsToDict(respondents) {
  // respondents = respondents.map((v) => _.map(v, (dt) => dt.toDate()));
  const hm = new DateMap();
  respondents.forEach((respondent) => {
    const { response } = respondent;
    const responder = respondentToUserIdOrName(respondent);
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
