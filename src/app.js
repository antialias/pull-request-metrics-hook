/* global Promise */
import "dotenv-safe/config";
import bodyParser from "koa-bodyparser";
import Koa from "koa";
import { set } from "object-path-immutable";
import getUnixTime from "date-fns/getUnixTime";
import axios from "axios";

import * as queries from "./queries";
import client from "./apollo-client";

const ddSeries = axios.create({
  baseURL: `https://api.datadoghq.com/api/v1/series?api_key=${process.env.datadogApiKey}`,
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
    const counts = pullRequests.edges.reduce(
      (acc, { node: pr }) => ({
        ...acc,
        [pr.state]: acc[pr.state] ? acc[pr.state] + 1 : 1,
      }),
      {},
    );
    const repos = Object.entries(
      pullRequests.edges.reduce(
        (acc, { node: pr }) => ({
          ...acc,
          [pr.baseRepository.nameWithOwner]: true,
        }),
        {},
      ),
    ).forEach(([key, val]) => `${key}:${val}`);
    const time = getUnixTime(new Date());
    await Promise.all(
      Object.entries(counts).map(([state, count]) =>
        // TODO: replace with query to graphql client via apollo-link-rest
        ddSeries.post("", {
          series: [
            {
              metric: `hackathon.prcount.${state}`,
              tags: repos,
              type: "gauge",
              points: [[time, count]],
            },
          ],
        }),
      ),
    );
  }
  ctx.response.status = 201;
});
export default app;
