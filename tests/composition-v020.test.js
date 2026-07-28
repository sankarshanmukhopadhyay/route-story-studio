import test from 'node:test';
import assert from 'node:assert/strict';
import { fitTileRange, MAX_MAP_TILES } from '../src/map/map-background.js';
import { LAYOUT_PRESETS } from '../src/render/layout-presets.js';
import { createPosterSvg } from '../src/render/poster-svg.js';

test('route-aware map fitting stays within tile budget',()=>{const route={segments:[{points:[{latitude:32.78,longitude:78.96},{latitude:32.63,longitude:79.49}]}]};const fit=fitTileRange(route);assert.ok(fit.count<=MAX_MAP_TILES);assert.ok(fit.z>=2);});
test('publication templates include social and print layouts',()=>{for(const id of ['editorial','expedition','a4','letter'])assert.ok(LAYOUT_PRESETS[id]);});
test('annotations are escaped and rendered on route geometry',()=>{const route={sourceType:'recorded-track',source:{name:'x'},segments:[{points:[{latitude:1,longitude:1,elevationMetres:1},{latitude:2,longitude:2,elevationMetres:2}]}]};const svg=createPosterSvg({route,statistics:{distanceMetres:1000,elevationGainMetres:10,durationSeconds:60},title:'x',annotations:[{label:'A < B',positionPercent:50}]});assert.match(svg,/A &lt; B/);});
