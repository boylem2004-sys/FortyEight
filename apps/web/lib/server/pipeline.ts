import "server-only";
import {
  fixtureGeocoder,
  heuristicRanker,
  stubAiWebProvider,
  stubGooglePlacesProvider,
  stubTicketmasterProvider,
  type PipelineDeps,
  type Provider,
} from "@fortyeight/core";

/**
 * Wires the recommendation pipeline. Phase 0 uses stub providers that return
 * fixture data. Phase 1 swaps in real providers (behind the cache), Google
 * geocoding, and the Claude ranker here, with no change to the route.
 */
export function getPipelineDeps(): PipelineDeps {
  return {
    providers: [stubTicketmasterProvider, stubGooglePlacesProvider] as Provider<unknown>[],
    webResearch: stubAiWebProvider as Provider<unknown>,
    geocoder: fixtureGeocoder,
    ranker: heuristicRanker,
    newId: () => crypto.randomUUID(),
    now: () => new Date(),
    fixtureData: true,
    onProviderError: (providerId, error) => console.error(`Provider ${providerId} failed`, error),
  };
}
