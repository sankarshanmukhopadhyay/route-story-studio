import { downloadBlob, safeFileStem } from './download.js';
export function downloadGeneratedText(text,title,extension,type){ downloadBlob(new Blob([text],{type}),`${safeFileStem(title,'planned-route')}.${extension}`); }
export function downloadReceipt(receipt,title){ downloadBlob(new Blob([JSON.stringify(receipt,null,2)+'\n'],{type:'application/json'}),`${safeFileStem(title,'planned-route')}-provenance-receipt.json`); }
