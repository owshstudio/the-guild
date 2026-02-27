/**
 * Shared SSE connection manager.
 *
 * Multiple hooks can subscribe to the same URL. Only one EventSource is opened
 * per unique URL, ref-counted so it closes when the last subscriber leaves.
 */

type Listener = (event: string, data: unknown) => void;

interface SharedConnection {
  es: EventSource;
  listeners: Set<Listener>;
  retries: number;
  reconnectTimer?: ReturnType<typeof setTimeout>;
}

const MAX_BACKOFF_MS = 30_000;
const connections = new Map<string, SharedConnection>();

function connect(url: string, conn: SharedConnection) {
  const es = new EventSource(url);
  conn.es = es;

  es.onopen = () => {
    const wasReconnect = conn.retries > 0;
    conn.retries = 0;
    if (wasReconnect) {
      // Notify all listeners of reconnect so they can refetch missed data
      conn.listeners.forEach((fn) => fn("__reconnect", null));
    }
  };

  es.onerror = () => {
    es.close();
    // Exponential backoff reconnect
    const delay = Math.min(1000 * Math.pow(2, conn.retries), MAX_BACKOFF_MS);
    conn.retries++;
    conn.reconnectTimer = setTimeout(() => {
      if (conn.listeners.size > 0) {
        connect(url, conn);
      }
    }, delay);
  };

  // Catch all named events via the generic message handler won't work —
  // SSE named events don't fire on `onmessage`. We need to add specific
  // event listeners. Use a set of known event types.
  const knownEvents = [
    "agent-change",
    "session-change",
    "cron-change",
  ];

  for (const eventType of knownEvents) {
    es.addEventListener(eventType, ((event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        conn.listeners.forEach((fn) => fn(eventType, data));
      } catch {
        // malformed data
      }
    }) as EventListener);
  }
}

export function subscribe(url: string, listener: Listener): () => void {
  let conn = connections.get(url);

  if (!conn) {
    // First subscriber — create connection
    conn = {
      es: null!,
      listeners: new Set(),
      retries: 0,
    };
    connections.set(url, conn);
    conn.listeners.add(listener);
    connect(url, conn);
  } else {
    conn.listeners.add(listener);
  }

  // Return unsubscribe function
  return () => {
    conn!.listeners.delete(listener);
    if (conn!.listeners.size === 0) {
      // Last subscriber left — tear down
      conn!.es?.close();
      clearTimeout(conn!.reconnectTimer);
      connections.delete(url);
    }
  };
}

export function isConnected(url: string): boolean {
  const conn = connections.get(url);
  return conn?.es?.readyState === EventSource.OPEN;
}
