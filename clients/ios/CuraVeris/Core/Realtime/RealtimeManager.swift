import Foundation

/**
 * WebSocket Realtime Client for iOS using URLSessionWebSocketTask.
 */
public final class RealtimeManager: ObservableObject {
    public static let shared = RealtimeManager()

    private var webSocketTask: URLSessionWebSocketTask?
    private let session = URLSession(configuration: .default)
    @Published public private(set) var isConnected: Bool = false

    private init() {}

    public func connect(url: URL = URL(string: "ws://localhost:8000/ws")!) {
        guard !isConnected else { return }

        var request = URLRequest(url: url)
        if let token = KeychainManager.shared.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        webSocketTask = session.webSocketTask(with: request)
        webSocketTask?.resume()
        isConnected = true

        receiveMessages()
    }

    public func send(message: String) {
        let msg = URLSessionWebSocketTask.Message.string(message)
        webSocketTask?.send(msg) { error in
            if let error = error {
                print("WebSocket send error: \(error.localizedDescription)")
            }
        }
    }

    public func disconnect() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        isConnected = false
        webSocketTask = nil
    }

    private func receiveMessages() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    print("Received WS: \(text)")
                case .data(let data):
                    print("Received WS binary: \(data.count) bytes")
                @unknown default:
                    break
                }
                self?.receiveMessages()
            case .failure(let error):
                print("WebSocket error: \(error.localizedDescription)")
                self?.isConnected = false
            }
        }
    }
}
