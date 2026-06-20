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
