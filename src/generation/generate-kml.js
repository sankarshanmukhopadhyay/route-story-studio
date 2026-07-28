function escapeXml(value) { return String(value ?? '').replace(/[<>&"']/g, (c) => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;' })[c]); }
export function generateKml(route, receipt) {
  if(route?.sourceType!=='planned-route') throw new Error('Only planned routes may be generated from acquired geometry.');
  const points=route.segments?.flatMap((segment)=>segment.points)||[]; if(points.length<2) throw new Error('Generated KML requires at least two route points.');
  const name=escapeXml(route.title||'Reconstructed planned route'); const coordinates=points.map((p)=>`${Number(p.longitude).toFixed(7)},${Number(p.latitude).toFixed(7)},${Number.isFinite(p.elevationMetres)?Number(p.elevationMetres).toFixed(2):0}`).join(' ');
  const start=points[0], finish=points.at(-1); const desc=escapeXml(`Reconstructed planned route. Not evidence of completed travel. Receipt: ${receipt.receiptId}`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${name}</name><description>${desc}</description><Placemark><name>Start</name><Point><coordinates>${start.longitude},${start.latitude},0</coordinates></Point></Placemark><Placemark><name>Finish</name><Point><coordinates>${finish.longitude},${finish.latitude},0</coordinates></Point></Placemark><Placemark><name>${name}</name><description>${desc}</description><LineString><tessellate>1</tessellate><coordinates>${coordinates}</coordinates></LineString></Placemark></Document></kml>\n`;
}
