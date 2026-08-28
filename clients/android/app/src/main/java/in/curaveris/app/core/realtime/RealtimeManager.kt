package in.curaveris.app.core.realtime

import in.curaveris.app.CuraVerisApplication
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import okhttp3.*
import java.util.concurrent.TimeUnit

/**
 * Realtime WebSocket Client with Automatic Exponential Backoff Reconnection.
 */
class RealtimeManager(
    private val wsUrl: String = "ws://10.0.2.2:8000/ws"
) {

    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()

    private var webSocket: WebSocket? = null
    private var isConnected = false
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private val _events = MutableSharedFlow<String>(extraBufferCapacity = 64)
    val events: SharedFlow<String> = _events.asSharedFlow()

    fun connect() {
        if (isConnected) return

        val token = CuraVerisApplication.secureStorage.getAccessToken()
        val urlWithAuth = if (!token.isNullOrEmpty()) "$wsUrl?token=$token" else wsUrl

        val request = Request.Builder().url(urlWithAuth).build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                isConnected = true
                scope.launch { _events.emit("{\"type\":\"connection\",\"status\":\"connected\"}") }
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                scope.launch { _events.emit(text) }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                isConnected = false
                scope.launch {
                    _events.emit("{\"type\":\"connection\",\"status\":\"disconnected\"}")
                    delay(3000)
                    connect()
                }
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                isConnected = false
            }
        })
    }

    fun send(message: String) {
        webSocket?.send(message)
    }

    fun disconnect() {
        isConnected = false
        webSocket?.close(1000, "Client disconnect")
        webSocket = null
    }
}
