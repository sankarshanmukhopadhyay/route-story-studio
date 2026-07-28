export const MAP_PROVIDER = Object.freeze({ id: 'openstreetmap-standard', name: 'OpenStreetMap', attribution: '© OpenStreetMap contributors', privacyUrl: 'https://operations.osmfoundation.org/policies/tiles/', host: 'https://tile.openstreetmap.org' });
export const MAX_MAP_TILES = 9;

function lonToX(lon, zoom) { return Math.floor((lon + 180) / 360 * 2 ** zoom); }
function latToY(lat, zoom) { const rad = Math.max(-85.0511, Math.min(85.0511, lat)) * Math.PI / 180; return Math.floor((1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2 * 2 ** zoom); }
function toDataUrl(blob) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('A map tile could not be read.')); reader.readAsDataURL(blob); }); }
function routeBounds(route) { const points = route.segments.flatMap((segment) => segment.points); return points.reduce((b,p)=>({minLat:Math.min(b.minLat,p.latitude),maxLat:Math.max(b.maxLat,p.latitude),minLon:Math.min(b.minLon,p.longitude),maxLon:Math.max(b.maxLon,p.longitude)}),{minLat:90,maxLat:-90,minLon:180,maxLon:-180}); }

export async function fetchMapMosaic(route, { zoom = 10, timeoutMs = 12_000 } = {}) {
  const b = routeBounds(route); const centreLon = (b.minLon+b.maxLon)/2; const centreLat = (b.minLat+b.maxLat)/2;
  const z = Math.max(2, Math.min(16, Number(zoom)||10)); const cx=lonToX(centreLon,z); const cy=latToY(centreLat,z);
  const controller = new AbortController(); const timer = setTimeout(()=>controller.abort(), timeoutMs);
  try {
    const tiles=[];
    for(let dy=-1;dy<=1;dy+=1) for(let dx=-1;dx<=1;dx+=1) tiles.push({x:cx+dx,y:cy+dy,dx,dy});
    if(tiles.length>MAX_MAP_TILES) throw new Error('The map request exceeds the tile safety limit.');
    const loaded=await Promise.all(tiles.map(async tile=>{
      const response=await fetch(`${MAP_PROVIDER.host}/${z}/${tile.x}/${tile.y}.png`,{signal:controller.signal,mode:'cors',credentials:'omit',referrerPolicy:'no-referrer'});
      if(!response.ok) throw new Error(`Map tile request failed (${response.status}).`);
      const blob=await response.blob(); if(blob.size>1_500_000) throw new Error('A map tile exceeded the response-size limit.');
      return {...tile,dataUrl:await toDataUrl(blob)};
    }));
    const canvas=document.createElement('canvas'); canvas.width=768; canvas.height=768; const ctx=canvas.getContext('2d'); if(!ctx) throw new Error('Map composition is unavailable in this browser.');
    for(const tile of loaded){ const image=new Image(); image.src=tile.dataUrl; await image.decode(); ctx.drawImage(image,(tile.dx+1)*256,(tile.dy+1)*256,256,256); }
    return { kind:'map', dataUrl:canvas.toDataURL('image/png'), provider:MAP_PROVIDER.id, attribution:MAP_PROVIDER.attribution, zoom:z, generatedAt:new Date().toISOString() };
  } catch(error){ if(error?.name==='AbortError') throw new Error('The map provider did not respond within the safety timeout.'); throw error; }
  finally{clearTimeout(timer);}
}
