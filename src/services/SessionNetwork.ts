// Service réseau minimal pour notifier l'hôte lorsqu'un joueur rejoint
// à partir des informations encodées dans le QR code.

export interface SessionConnectionInfo {
  sessionId: string;
  hostIp: string;
  hostPort: number;
  protocol: 'http' | 'https';
}

type JoinResponse = {
  ok: boolean;
  status: number;
  body?: any;
};

const DEFAULT_TIMEOUT_MS = 3000;

function timeoutPromise<T>(ms: number, promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function notifyHostPlayerJoined(
  info: SessionConnectionInfo,
  playerName: string,
  options?: { timeoutMs?: number; retry?: number }
): Promise<JoinResponse> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retry = Math.max(0, options?.retry ?? 1);

  // Convention d'URL côté hôte: /api/session/:sessionId/join
  const baseUrl = `${info.protocol}://${info.hostIp}:${info.hostPort}`;
  const url = `${baseUrl}/api/session/${encodeURIComponent(info.sessionId)}/join`;

  const body = { name: playerName };

  let lastError: any = null;
  for (let attempt = 0; attempt <= retry; attempt++) {
    try {
        console.log(url);
      const res = await timeoutPromise(
        timeoutMs,
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      );

      let parsed: any = undefined;
      try {
        parsed = await (res as Response).json();
      } catch (_) {
        // corps vide ou non JSON — ignorer
      }

      return {
        ok: (res as Response).ok,
        status: (res as Response).status,
        body: parsed,
      };
    } catch (err) {
      lastError = err;
      if (attempt < retry) {
        // petite attente avant retry
        await new Promise((r) => setTimeout(r, 150));
        continue;
      }
    }
  }

  throw lastError ?? new Error('Network error');
}

// Remarques d'intégration côté hôte:
// - L'hôte doit exposer un serveur HTTP accessible sur le réseau local,
//   écoutant sur hostPort, et implémentant: POST /api/session/:sessionId/join
//   avec body JSON: { name: string }.
// - Réponse attendue: 2xx si accepté. Le client gère un timeout court et 1 retry.
// - En production Android, si vous utilisez HTTP clair (non TLS), il peut être
//   nécessaire d'activer usesCleartextTraffic=true ou de passer en HTTPS.
