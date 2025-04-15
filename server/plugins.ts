export function decodePayload(protocol: string, payload: Buffer): string {
 switch (protocol.toUpperCase()) {
   case 'HTTP':
     return decodeHTTP(payload);
   case 'DNS':
     return decodeDNS(payload);
   default:
     return payload.toString('utf-8');
 }
}

function decodeHTTP(payload: Buffer): string {
 const text = payload.toString('utf-8');
 const [headerPart, ...bodyParts] = text.split('\\r\\n\\r\\n');
 const headers = headerPart.split('\\r\\n');
 const body = bodyParts.join('\\r\\n\\r\\n');
 return JSON.stringify({ headers, body }, null, 2);
}

function decodeDNS(payload: Buffer): string {
 return `DNS Payload: ${payload.toString('hex')}`;
}