// Realtime (socket.io) is NOT routed in this single-container Railway deploy: there
// is no proxy from /socket.io/ to the :9000 node server, so opening a connection
// only spams /socket.io/ 404s. Attempts to neuter the socket.io client (autoConnect,
// connect/open, the Manager) didn't stop the polling transport, so instead we never
// create a client at all: return an inert stub exposing the bits callers use
// (.on/.off/.emit), so nothing connects and no component breaks.
// Restore the real io() connection once /socket.io/ is routed to the node server.
export function initSocket() {
  const noop = () => stub
  const stub = {
    connected: false,
    disconnected: true,
    id: null,
    on: noop,
    off: noop,
    once: noop,
    emit: noop,
    send: noop,
    connect: noop,
    disconnect: noop,
    open: noop,
    close: noop,
    onAny: noop,
    offAny: noop,
    io: { on: noop, off: noop, open: noop, close: noop, reconnection: noop },
  }
  return stub
}
