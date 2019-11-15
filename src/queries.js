import gql from "graphql-tag";

export const openPRs = gql`
  query getOpenPrs($after: String, $owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      databaseId
      description
      pullRequests(states: [OPEN], first: 10, after: $after) {
        totalCount
        edges {
          cursor
          node {
            state
            baseRepository {
              nameWithOwner
            }
            number
            state
            author {
              login
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;
