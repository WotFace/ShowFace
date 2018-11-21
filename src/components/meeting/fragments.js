import gql from 'graphql-tag';

export const respondentFragment = gql`
  fragment RespondentFragment on Respondent {
    id
    anonymousName
    user {
      email
      name
      uid
    }
    role
    response
  }
`;

export const showWithoutRespondentsFragment = gql`
  fragment ShowWithoutRespondentsFragment on Show {
    id
    slug
    name
    isPrivate
    isReadOnly
    areResponsesHidden
    dates
    startTime
    endTime
    interval
  }
`;

export const showFragment = gql`
  fragment ShowFragment on Show {
    ...ShowWithoutRespondentsFragment
    respondents {
      ...RespondentFragment
    }
  }
  ${showWithoutRespondentsFragment}
  ${respondentFragment}
`;
