import SwiftUI

enum AppNavigationState {
    case splash
    case auth
    case authenticated
}

@main
struct CuraVerisApp: App {
    @State private var appState: AppNavigationState = .splash

    init() {
        NotificationManager.shared.requestAuthorization { granted in
            if granted {
                print("Notification permission granted.")
            }
        }
    }

    var body: some Scene {
        WindowGroup {
            ZStack {
                switch appState {
                case .splash:
                    SplashView { isAuthenticated in
                        withAnimation(.easeInOut) {
                            appState = isAuthenticated ? .authenticated : .auth
                        }
                    }
                case .auth:
                    AuthView {
                        withAnimation(.easeInOut) {
                            appState = .authenticated
                        }
                    }
                case .authenticated:
                    MainAppShell()
                }
            }
            .onOpenURL { url in
                // Handle deep links: curaveris://audit/{id}
                print("Received deep link URL: \(url)")
            }
        }
    }
}
