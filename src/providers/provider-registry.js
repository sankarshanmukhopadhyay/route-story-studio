import { OPENROUTESERVICE_PROVIDER, createOpenRouteServiceAdapter } from './openrouteservice-adapter.js';

export const PROVIDERS = Object.freeze([OPENROUTESERVICE_PROVIDER]);

export function getProviderMetadata(id) {
  const provider = PROVIDERS.find((item) => item.id === id);
  if (!provider) throw new Error('The selected routing provider is not supported.');
  return provider;
}

export function createProviderAdapter(id, options) {
  getProviderMetadata(id);
  if (id === OPENROUTESERVICE_PROVIDER.id) return createOpenRouteServiceAdapter(options);
  throw new Error('The selected routing provider has no configured adapter.');
}
