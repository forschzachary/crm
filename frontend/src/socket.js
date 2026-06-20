import { io } from 'socket.io-client'
import { socketio_port } from '../../../../sites/common_site_config.json'
import { getCachedListResource, getCachedResource } from 'frappe-ui'

export function initSocket() {
  let host = window.location.hostname
  let siteName = window.site_name
  let port = window.location.port ? `:${socketio_port}` : ''
  let protocol = port ? 'http' : 'https'
  let url = `${protocol}://${host}${port}/${siteName}`

  // Realtime is not wired in this single-container Railway deploy (no nginx to
  // route /socket.io/ -> the :9000 node server), so auto-connecting just spams
  // 404s. Keep the socket object valid for callers but don't open the connection.
  // Re-enable (drop autoConnect) once a front proxy routes /socket.io/.
  let socket = io(url, {
    withCredentials: true,
    reconnectionAttempts: 5,
    autoConnect: false,
  })
  // frappe-ui's realtime resources call socket.connect() to subscribe, which
  // overrides autoConnect and spams /socket.io/ 404s in this proxy-less deploy.
  // Neuter connect/open so the socket can never poll; .on/.off/.emit still work
  // (they just no-op), so no caller breaks. Drop these once /socket.io/ is routed.
  socket.connect = () => socket
  socket.open = () => socket
  // The open happens at the Manager level (socket.io), below socket.connect().
  // Neuter the Manager too: disable reconnection and stub its open/connect so the
  // polling transport can never start. .on/.off/.emit still work (no-op realtime).
  try {
    socket.io.reconnection(false)
    socket.io.open = () => socket.io
    socket.io.connect = () => socket.io
  } catch (e) {
    /* manager not available */
  }
  socket.on('refetch_resource', (data) => {
    if (data.cache_key) {
      let resource =
        getCachedResource(data.cache_key) ||
        getCachedListResource(data.cache_key)
      if (resource) {
        resource.reload()
      }
    }
  })
  return socket
}
