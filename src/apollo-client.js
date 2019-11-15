import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import fetch from "node-fetch";

export default new ApolloClient({
  cache: new InMemoryCache(),
  link: createHttpLink({
    fetch,
    uri: process.env.githubGraphQLApi,
    headers: {
      Authorization: `bearer ${process.env.githubToken}`,
    },
  }),
  name: "github-graphql-api",
  defaultOptions: {
    query: {
      fetchPolicy: "no-cache",
    },
  },
});
