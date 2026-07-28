import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveShortLink } from '../gateway/src/index.js';
import { validateGatewayUrl } from '../gateway/src/redirect-policy.js';
import { resolveGoogleMapsShortLink, validateResolution } from '../src/acquisition/short-link-resolver.js';

function redirect(location, status=302){ return new Response(null,{status,headers:{location}}); }

test('gateway follows approved Google redirects only', async()=>{
  const responses=new Map([
    ['https://maps.app.goo.gl/abc',redirect('https://www.google.com/maps/dir/?api=1&origin=Delhi&destination=Agra')],
    ['https://www.google.com/maps/dir/?api=1&origin=Delhi&destination=Agra',new Response('',{status:200})]
  ]);
  const result=await resolveShortLink('https://maps.app.goo.gl/abc',{fetchImpl:async(url)=>responses.get(url)});
  assert.equal(result.redirectCount,1); assert.equal(result.finalHost,'www.google.com');
});

test('gateway rejects redirects outside the approved host set', async()=>{
  await assert.rejects(()=>resolveShortLink('https://maps.app.goo.gl/abc',{fetchImpl:async()=>redirect('https://example.com/route')}),/approved Google Maps host/);
});

test('gateway rejects private network and non-HTTPS targets',()=>{
  assert.throws(()=>validateGatewayUrl('https://127.0.0.1/x'),/Private-network/);
  assert.throws(()=>validateGatewayUrl('http://maps.app.goo.gl/x',{input:true}),/HTTPS/);
});

test('browser client validates and accepts a constrained resolution response', async()=>{
  const fetchImpl=async()=>new Response(JSON.stringify({status:'resolved',sourceUrl:'https://maps.app.goo.gl/abc',finalUrl:'https://www.google.com/maps/dir/?api=1&origin=Delhi&destination=Agra',finalHost:'www.google.com',redirectCount:1,resolvedAt:'2026-07-28T00:00:00.000Z'}),{status:200,headers:{'content-type':'application/json'}});
  const result=await resolveGoogleMapsShortLink('https://maps.app.goo.gl/abc',{endpoint:'https://resolver.example.workers.dev/resolve',fetchImpl});
  assert.equal(result.finalHost,'www.google.com');
});

test('client rejects an unresolved short URL returned by a gateway',()=>{
  assert.throws(()=>validateResolution({status:'resolved',sourceUrl:'https://maps.app.goo.gl/a',finalUrl:'https://maps.app.goo.gl/b',redirectCount:1,resolvedAt:'2026-07-28T00:00:00Z'}),/did not reach a full/);
});
