// Un bus d'événements léger pour la session, afin de notifier l'hôte
// lorsqu'un joueur rejoint après avoir scanné le QR code.

export type PlayerJoinedPayload = { name: string };

type Listener<T> = (payload: T) => void;

class SimpleEventBus {
  private listeners: {
    [event: string]: Set<Listener<any>>;
  } = {};

  on<T>(event: string, listener: Listener<T>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    // @ts-expect-error stockage générique
    this.listeners[event].add(listener);
    return () => this.off(event, listener as any);
  }

  off<T>(event: string, listener: Listener<T>) {
    this.listeners[event]?.delete(listener as any);
  }

  emit<T>(event: string, payload: T) {
    const ls = this.listeners[event];
    if (!ls || ls.size === 0) return;
    // Copier pour éviter les effets de modifications en cours d'itération
    Array.from(ls).forEach((l) => {
        try {
        // @ts-expect-error
        l(payload);
      } catch (e) {
        console.warn('[SessionEvents] listener error for', event, e);
      }
    });
  }
}

export const sessionEvents = new SimpleEventBus();

// Événements standards utilisés dans l'application:
// - "playerJoined": PlayerJoinedPayload
// Exemple d'émission (depuis la couche réseau quand un invité rejoint):
//   sessionEvents.emit<PlayerJoinedPayload>('playerJoined', { name: 'Alice' });
