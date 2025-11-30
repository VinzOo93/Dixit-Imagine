import TcpSocket from 'react-native-tcp-socket';
import { Buffer } from 'buffer';
import { sessionEvents } from './SessionEvents';

interface PlayerJoinRequest {
  name: string;
}

interface Session {
  id: string;
  players: string[];
}

// Store sessions hosted on this device
const sessions: Record<string, Session> = {};

function parseHttpRequest(data: string) {
  const [header, body] = data.split('\r\n\r\n');
  const lines = header.split('\r\n');
  const [method, path] = lines[0].split(' ');
  return { method, path, body } as { method: string; path: string; body: string };
}

function sendHttpResponse(socket: any, status: number, bodyObj: any) {
  const body = JSON.stringify(bodyObj);
  const response =
    `HTTP/1.1 ${status} ${status === 200 ? 'OK' : 'ERROR'}\r\n` +
    `Content-Type: application/json\r\n` +
    `Content-Length: ${Buffer.byteLength(body)}\r\n` +
    `Connection: close\r\n\r\n` +
    body;
  socket.write(response);
  socket.destroy();
}

/**
 * Démarre le serveur hôte minimal pour accepter les POST /api/session/:sessionId/join
 * et émettre un événement 'playerJoined' via SessionEvents.
 */
export function startHostServer(sessionId: string, port = 8080) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = { id: sessionId, players: [] };
  }

  const server = TcpSocket.createServer((socket) => {
    socket.on('data', (data) => {
      try {
        const requestStr = data.toString();
        const { method, path, body } = parseHttpRequest(requestStr);
        console.log(`[HostServer] Incoming request: ${method} ${path}`);
        const joinMatch = path.match(/^\/api\/session\/(.+)\/join$/);
        if (method === 'POST' && joinMatch) {
          const reqSessionId = decodeURIComponent(joinMatch[1]);
          const session = sessions[reqSessionId];
          if (!session) {
            sendHttpResponse(socket, 404, { ok: false, error: 'Session not found' });
            return;
          }

          let parsedBody: PlayerJoinRequest;
          try {
            parsedBody = JSON.parse(body);
          } catch (err) {
            sendHttpResponse(socket, 400, { ok: false, error: 'Invalid JSON' });
            return;
          }

          if (!parsedBody.name) {
            sendHttpResponse(socket, 400, { ok: false, error: 'Missing player name' });
            return;
          }

          if (!session.players.includes(parsedBody.name)) {
            session.players.push(parsedBody.name);
          }
          console.log(`[HostServer] Player joined: ${parsedBody.name} | Session: ${reqSessionId}`);

          // Notifier l'UI de l'hôte via le bus d'événements
          sessionEvents.emit('playerJoined', { name: parsedBody.name });

          sendHttpResponse(socket, 200, { ok: true, players: session.players });
        } else {
          sendHttpResponse(socket, 404, { ok: false, error: 'Not found' });
        }
      } catch (err) {
        console.error('[HostServer] Error handling request:', err);
        sendHttpResponse(socket, 500, { ok: false, error: 'Internal server error' });
      }
    });

    socket.on('error', (err) => console.error('[HostServer] Socket error:', err));
  });

  server.listen({ port, host: '0.0.0.0' }, () => {
    console.log(`[HostServer] Listening on 0.0.0.0:${port}`);
  });

  return server;
}
