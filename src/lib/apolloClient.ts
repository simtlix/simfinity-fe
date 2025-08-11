"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3000/graphql";

export const apolloClient = new ApolloClient({
  ssrMode: typeof window === "undefined",
  link: new HttpLink({ uri: GRAPHQL_URL }),
  cache: new InMemoryCache(),
});



