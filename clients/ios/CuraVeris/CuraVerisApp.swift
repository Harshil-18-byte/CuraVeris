import SwiftUI

@main
struct CuraVerisApp: App {
    init() {
        NotificationManager.shared.requestAuthorization { granted in
            if granted {
                print("Notification permission granted.")
            }
        }
    }

    var body: some Scene {
        WindowGroup {
            DashboardView()
                .onOpenURL { url in
                    // Handle deep links: curaveris://audit/{id}
                    print("Received deep link URL: \(url)")
                }
        }
    }
}
