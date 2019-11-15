import "dotenv-safe/config";
import bodyParser from "koa-bodyparser";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import Koa from "koa";
import * as queries from "./queries";
import fetch from "node-fetch";
import HotShots from "hot-shots";
import { set } from "object-path-immutable";

const statsd = new HotShots({
  prefix: "pull-requests",
});

const client = new ApolloClient({
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

const app = new Koa();
app.use(bodyParser());
app.use(async ctx => {
  const {
    owner: { login: owner },
    name,
  } = ctx.request.body.repository;
  const variables = {
    owner,
    name,
  };
  let pullRequests = set({}, "pageInfo.hasNextPage", true);
  while (pullRequests.pageInfo.hasNextPage) {
    ({ pullRequests } = (
      await client.query({
        query: queries.openPRs,
        variables: {
          ...variables,
          after: pullRequests.pageInfo.endCursor,
        },
      })
    ).data.repository);
    pullRequests.edges.forEach(({ node: pr }) =>
      statsd.set(
        process.env.metricName,
        `${pr.baseRepository.nameWithOwner}/pull/${pr.number}`,
        {
          state: pr.state,
          author: pr.author.login,
        },
      ),
    );
  }
  ctx.response.status = 201;
});
export default app;
