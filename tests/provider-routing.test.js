import test from 'node:test';import assert from 'node:assert/strict';
import { createOpenRouteServiceAdapter, MAX_GEOCODE_CANDIDATES, MAX_ROUTING_WAYPOINTS } from '../src/providers/openrouteservice-adapter.js';
import { PROVIDERS } from '../src/providers/provider-registry.js';
import { fitTileRange, MAX_MAP_TILES } from '../src/map/map-background.js';

test('registers a provider-neutral openrouteservice adapter',()=>{assert.equal(PROVIDERS[0].id,'openrouteservice');assert.ok(MAX_GEOCODE_CANDIDATES<=5);assert.equal(MAX_ROUTING_WAYPOINTS,25);});
test('validates provider keys before external use',()=>{assert.throws(()=>createOpenRouteServiceAdapter({apiKey:'short'}),/valid openrouteservice API key/);});
test('map zoom controls stay inside the tile budget',()=>{const route={segments:[{points:[{latitude:28.6,longitude:77.2},{latitude:32.2,longitude:78.9}]}]};for(const zoomAdjustment of[-2,-1,0,1,2]){const range=fitTileRange(route,{zoomAdjustment});assert.ok(range.count<=MAX_MAP_TILES);assert.equal(range.zoomAdjustment,zoomAdjustment);}});
test('closer map zoom is marked as potentially cropped',()=>{const route={segments:[{points:[{latitude:28.6,longitude:77.2},{latitude:32.2,longitude:78.9}]}]};assert.equal(fitTileRange(route,{zoomAdjustment:1}).cropped,true);});

test('geocodes candidates and routes confirmed coordinates through the adapter', async () => {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('/geocode/search')) {
      return new Response(JSON.stringify({ features: [{ geometry: { coordinates: [77.2, 28.6] }, properties: { label: 'Delhi, India', country: 'India', confidence: 0.9 } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: [[77.2, 28.6], [77.3, 28.7]] }, properties: { summary: { distance: 1000, duration: 100 } } }], metadata: { attribution: 'openrouteservice' } }), { status: 200, headers: { 'content-type': 'application/geo+json' } });
  };
  const adapter = createOpenRouteServiceAdapter({ apiKey: '12345678901234567890', fetchImpl });
  const candidates = await adapter.geocode('Delhi');
  assert.equal(candidates[0].label, 'Delhi, India');
  const result = await adapter.route([{ coordinates: { longitude: 77.2, latitude: 28.6 } }, { coordinates: { longitude: 77.3, latitude: 28.7 } }]);
  assert.equal(result.points.length, 2);
  assert.equal(calls[0].options.headers.Authorization, '12345678901234567890');
  assert.equal(calls[1].options.method, 'POST');
});
