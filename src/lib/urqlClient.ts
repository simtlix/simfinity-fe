"use client";

import { Client, cacheExchange, fetchExchange } from "urql";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3000/graphql";

export const urqlClient = new Client({
  url: GRAPHQL_URL,
  exchanges: [cacheExchange, fetchExchange],
  // Force POST method for all requests (queries and mutations)
  fetchOptions: {
    method: 'POST',
  },
  requestPolicy: 'network-only',
});

