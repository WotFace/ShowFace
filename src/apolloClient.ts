import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';

// Configure client largely using the default Apollo Boost config.
// See https://www.apollographql.com/docs/react/advanced/boost-migration.html
const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    // TODO: Set up subscriptions.
    // Refer to https://www.apollographql.com/docs/react/advanced/subscriptions.html#subscriptions-client
    new HttpLink({
      uri: process.env.REACT_APP_API_SERVER_ENDPOINT,
    }),
  ]),
  cache: new InMemoryCache(),
});

export default client;
