import Foundation
import Security

/**
 * Native iOS Keychain Services Wrapper for Secure Token Storage.
 */
public final class KeychainManager {
    public static let shared = KeychainManager()
    private let serviceName = "in.curaveris.app.keychain"

    private enum Keys {
        static let accessToken = "jwt_access_token"
        static let refreshToken = "jwt_refresh_token"
        static let userId = "user_id"
        static let userRole = "user_role"
    }

    private init() {}

    public func saveAccessToken(_ token: String) {
        save(key: Keys.accessToken, data: Data(token.utf8))
    }

    public func getAccessToken() -> String? {
        guard let data = read(key: Keys.accessToken) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    public func saveRefreshToken(_ token: String) {
        save(key: Keys.refreshToken, data: Data(token.utf8))
    }

    public func getRefreshToken() -> String? {
        guard let data = read(key: Keys.refreshToken) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    public func clearSession() {
        delete(key: Keys.accessToken)
        delete(key: Keys.refreshToken)
        delete(key: Keys.userId)
        delete(key: Keys.userRole)
    }

    public var isAuthenticated: Bool {
        return getAccessToken() != nil
    }

    private func save(key: String, data: Data) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]

        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    private func read(key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)

        if status == errSecSuccess {
            return dataTypeRef as? Data
        }
        return nil
    }

    private func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
    }
}
