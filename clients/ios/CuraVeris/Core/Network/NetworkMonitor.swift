import Foundation
import Network

/**
 * Realtime iOS Network Reachability Observer using NWPathMonitor.
 */
public final class NetworkMonitor: ObservableObject {
    public static let shared = NetworkMonitor()

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "in.curaveris.networkmonitor")

    @Published public private(set) var isConnected: Bool = true
    @Published public private(set) var isExpensive: Bool = false

    private init() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
                self?.isExpensive = path.isExpensive
            }
        }
        monitor.start(queue: queue)
    }

    deinit {
        monitor.cancel()
    }
}
