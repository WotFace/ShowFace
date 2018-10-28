// Shape of returned Map:
// {
//   admin: [{ slug: '', anonymousName: '' }],
//   pending: [{ slug: '' }],
//   responded: [{ slug: '', anonymousName: '' }],
// };
export function userShowsToDict(userShows, email) {
  var adminShows = [];
  var pendingShows = [];
  var respondedShows = [];

  userShows.forEach((userShow) => {
    const respondents = userShow.respondents;
    console.log(userShow.respondents);
    if (respondents && respondents.length !== 0) {
      respondents.forEach((respondent) => {
        if (respondent.user.email !== email) {
          return;
        }

        if (respondent.role === 'admin') {
          adminShows.push({ slug: userShow.slug });
        }

        if (respondent.response.length === 0) {
          pendingShows.push({ slug: userShow.slug });
        } else {
          respondedShows.push({ slug: userShow.slug, anonymousName: respondent.anonymousName });
        }
      });
    }
  });
  return { admin: adminShows, pending: pendingShows, responded: respondedShows };
}
