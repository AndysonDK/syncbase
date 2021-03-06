import { cacheExchange } from "@urql/exchange-graphcache";
import { i18n } from "next-i18next";
import {
  /* initUrqlClient,*/
  withUrqlClient as withNextUrqlClient,
} from "next-urql";
import { toast } from "react-hot-toast";
import {
  dedupExchange,
  errorExchange,
  fetchExchange /* ssrExchange*/,
} from "urql";
import { MeDocument } from "./generated";
import type { GraphCacheConfig, RegularUserFragment } from "./generated";
// import type { DocumentNode } from "graphql";
import type { NextPage, NextPageContext } from "next";
import type { SSRExchange } from "next-urql";
import type { ClientOptions } from "urql";

const SERVER_PORT = process.env.NEXT_PUBLIC_IS_TEST ? 8082 : 8080;

const buildUrqlConfig = (
  ssrExchange: SSRExchange,
  ctx?: NextPageContext
): ClientOptions => ({
  url: `http://localhost:${SERVER_PORT}/graphql`,
  fetchOptions: {
    credentials: "include",
    headers: { cookie: ctx?.req?.headers?.cookie || "" },
  },
  exchanges: [
    dedupExchange,
    cacheExchange<GraphCacheConfig>({
      updates: {
        Mutation: {
          loginUser: (result, _args, cache) => {
            cache.updateQuery({ query: MeDocument }, () => ({
              me: result.loginUser as RegularUserFragment,
            }));
          },
          registerUser: (result, _args, cache) => {
            cache.updateQuery({ query: MeDocument }, () => ({
              me: result.registerUser as RegularUserFragment,
            }));
          },
          logoutUser: (_result, _args, cache) => {
            cache.updateQuery({ query: MeDocument }, () => ({ me: null }));
          },
        },
      },
    }),
    ssrExchange,
    errorExchange({
      onError: (error) => {
        error.graphQLErrors.forEach((error) => {
          //  Don't display errors in a toast if it's meant to be displayed at some input field
          if (!error.extensions.field && typeof window !== "undefined") {
            toast.error(i18n!.t(error.message));
          }
        });
      },
    }),
    fetchExchange,
  ],
});

// export const urqlSSRClient = async (queries: DocumentNode[]) => {
//  const ssrCache = ssrExchange({ isClient: false });
//  const urqlConfig = buildUrqlConfig(ssrCache);
//  const client = initUrqlClient(urqlConfig, false);
//
//  for (const query of queries) await client!.query(query).toPromise();
//
//  return { urqlState: ssrCache.extractData() };
// };
//
// The way urqlSSRClient should be used is as follows:
//
// export const getStaticProps: GetStaticProps = async ({ locale }) => ({
//  props: {
//    ...(await serverSideTranslations(locale!, ["common", "auth", "user"])),
//    ...(await urqlSSRClient([UsersDocument])),
//  },
// });

export const withUrqlClient = (page: NextPage) =>
  withNextUrqlClient(buildUrqlConfig)(page);
