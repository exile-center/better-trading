import Apollo from 'ember-apollo-client/services/apollo';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloLink, FetchResult, Observable} from 'apollo-link';
import {ApolloClient, OperationVariables, QueryOptions, ApolloQueryResult, WatchQueryOptions, ObservableQuery, MutationOptions, SubscriptionOptions} from 'apollo-client';

declare module 'ember-apollo-client/services/apollo' {
  export default class ApolloService {
    client: ApolloClient<InMemoryCache>;
    cache(): InMemoryCache;
    link(): ApolloLink;
    query: (options: QueryOptions<OperationVariables>, resultKey?: string) => Promise<ApolloQueryResult<any>>;
    watchQuery: (options: WatchQueryOptions<OperationVariables>, resultKey?: string) => ObservableQuery<any, OperationVariables>;
    mutate: (options: MutationOptions<any, OperationVariables>, resultKey?: string) => Promise<FetchResult<any>>;
    subscribe: (options: SubscriptionOptions<OperationVariables>, resultKey?: string) => Observable<any>;
  }
}
