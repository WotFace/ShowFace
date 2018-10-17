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
