import { WebSocketServer } from 'ws';
// @ts-ignore
import { Cap, decoders } from 'cap';

const { PROTOCOL } = decoders;
const wss = new WebSocketServer({ port: 3001 });

const cap = new Cap();
const buffer = Buffer.alloc(65535);
const device = Cap.findDevice('192.168.15.22');
const linkType = cap.open(device!, 'ip', 10 * 1024 * 1024, buffer);
cap.setMinBytes && cap.setMinBytes(0);

function hexDump(buffer: Buffer, offset: number, length: number): string {
  const bytes = buffer.subarray(offset, offset + length);
  return [...bytes]
    .map((b, i) =>
      (i % 16 === 0 ? `\n${i.toString(16).padStart(4, '0')}: ` : '') +
      b.toString(16).padStart(2, '0') + ' '
    )
    .join('') + '\n';
}

function decodeHTTP(buffer: Buffer): string {
  try {
    const text = buffer.toString('utf-8');
    const [header, ...bodyParts] = text.split('\r\n\r\n');
    const body = bodyParts.join('\r\n\r\n');
    return `Headers:\n${header}\n\nBody:\n${body}`;
  } catch {
    return '[Erro na decodificação HTTP]';
  }
}

function decodeDNS(buffer: Buffer): string {
  try {
    const hex = buffer.toString('hex');
    return `[DNS Payload - Hex]:\n${hex}`;
  } catch {
    return '[Erro na decodificação DNS]';
  }
}

function detectProtocol(proto: number, sport: number, dport: number): string {
  if (proto === PROTOCOL.IP.TCP || proto === PROTOCOL.IP.UDP) {
    if (sport === 80 || dport === 80) return 'HTTP';
    if (sport === 443 || dport === 443) return 'HTTPS';
    if (sport === 53 || dport === 53) return 'DNS';
  }
  if (proto === PROTOCOL.IP.ICMP) return 'ICMP';
  if (proto === PROTOCOL.IP.UDP) return 'UDP';
  return 'UNKNOWN';
}

wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  ws.send(JSON.stringify({ type: 'status', message: 'Conectado ao sniffer' }));

  cap.on('packet', (nbytes: number) => {
    if (linkType !== 'ETHERNET') return;

    const timestamp = Date.now();
    const eth = decoders.Ethernet(buffer);
    if (eth.info.type !== PROTOCOL.ETHERNET.IPV4) return;

    const ip = decoders.IPV4(buffer, eth.offset);
    const proto = ip.info.protocol;
    let sport = -1;
    let dport = -1;
    let payloadOffset = 0;
    let transport: any = {};

    try {
      if (proto === PROTOCOL.IP.TCP) {
        const tcp = decoders.TCP(buffer, ip.offset);
        sport = tcp.info.srcport;
        dport = tcp.info.dstport;
        payloadOffset = tcp.offset;
        transport = {
          protocol: 'TCP',
          srcPort: sport,
          dstPort: dport,
          seq: tcp.info.seqno,
          ack: tcp.info.ackno,
          flags: tcp.info.flags,
          window: tcp.info.window
        };
      } else if (proto === PROTOCOL.IP.UDP) {
        const udp = decoders.UDP(buffer, ip.offset);
        sport = udp.info.srcport;
        dport = udp.info.dstport;
        payloadOffset = udp.offset;
        transport = {
          protocol: 'UDP',
          srcPort: sport,
          dstPort: dport
        };
      } else if (proto === PROTOCOL.IP.ICMP) {
        payloadOffset = ip.offset;
        transport = { protocol: 'ICMP' };
      }
    } catch (err) {
      console.error('Erro ao parsear pacote:', err);
      return;
    }

    const protocol = detectProtocol(proto, sport, dport);
    const payloadBuffer = buffer.subarray(payloadOffset, nbytes);

    let decodedPayload = '';
    if (protocol === 'HTTP') {
      decodedPayload = decodeHTTP(payloadBuffer);
    } else if (protocol === 'DNS') {
      decodedPayload = decodeDNS(payloadBuffer);
    } else {
      decodedPayload = payloadBuffer.toString('utf-8');
    }

    const packet = {
      frame: {
        length: nbytes,
        capturedLength: nbytes,
        timestamp
      },
      ethernet: {
        src: eth.info.shost,
        dst: eth.info.dhost,
        type: 'IPv4'
      },
      ip: {
        version: 4,
        src: ip.info.srcaddr,
        dst: ip.info.dstaddr,
        protocol: proto === 6 ? 'TCP' : proto === 17 ? 'UDP' : proto
      },
      transport,
      application: {
        protocol,
        payload: decodedPayload,
        rawPayload: hexDump(buffer, payloadOffset, nbytes - payloadOffset)
      }
    };

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'packet', data: packet }));
      }
    });
  });
});