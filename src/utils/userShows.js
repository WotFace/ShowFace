// Shape of returned Map:
// {
//   admin: [ShowWithRespondent],
//   pending: [ShowWithRespondent],
//   responded: [ShowWithRespondent],
// };
//
// where a ShowWithRespondent = { show: Show, respondent: Respondent }
export function userShowsToDict(userShows, email) {
  const adminShows = [];
  const pendingShows = [];
  const respondedShows = [];

  userShows.forEach((show) => {
    const respondents = show.respondents;
    if (respondents && respondents.length !== 0) {
      respondents.forEach((respondent) => {
        if (respondent.user === null || respondent.user.email !== email) {
          return;
        }

        const showWithRespondent = { show, respondent };
        if (respondent.role === 'admin') {
          adminShows.push(showWithRespondent);
        }

        if (respondent.response.length === 0) {
          pendingShows.push(showWithRespondent);
        } else {
          respondedShows.push(showWithRespondent);
        }
      });
    }
  });
  return { adminShows, pendingShows, respondedShows };
}
