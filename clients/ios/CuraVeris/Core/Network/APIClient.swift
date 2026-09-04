import Foundation

public enum APIError: LocalizedError {
    case invalidURL
    case httpError(statusCode: Int, code: String, message: String)
    case decodingError(Error)
    case encodingError(Error)
    case networkError(Error)

    public var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL request endpoint."
        case .httpError(let statusCode, let code, let message):
            return "[\(code)] HTTP \(statusCode): \(message)"
        case .decodingError(let error):
            return "Failed to parse API response: \(error.localizedDescription)"
        case .encodingError(let error):
            return "Failed to encode request payload: \(error.localizedDescription)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}

public struct HealthCheckResponse: Codable {
    public let status: String
    public let environment: String
    public let version: String
    public let database: Bool?
    public let reference_db: Bool?
}

public struct OTPSendRequestPayload: Codable {
    public let destination: String
    public let channel: String
    public init(destination: String, channel: String = "email") {
        self.destination = destination
        self.channel = channel
    }
}

public struct OTPSendResponsePayload: Codable {
    public let status: String
    public let message: String
    public let expires_in_seconds: Int
}

public struct OTPVerifyRequestPayload: Codable {
    public let destination: String
    public let otp: String
    public init(destination: String, otp: String) {
        self.destination = destination
        self.otp = otp
    }
}

public struct AuthTokenResponse: Codable {
    public let access_token: String
    public let refresh_token: String
    public let token_type: String
    public let expires_in: Int
}

/**
 * Async/Await Networking Client with Request ID Correlation and JWT Bearer Injection.
 */
public final class APIClient {
    public static let shared = APIClient()
    private let baseURL = URL(string: "http://localhost:8000")!
    private let session: URLSession

    private init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 20
        configuration.timeoutIntervalForResource = 30
        self.session = URLSession(configuration: configuration)
    }

    public func get<T: Decodable>(endpoint: String) async throws -> T {
        guard let url = URL(string: endpoint, relativeTo: baseURL) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(UUID().uuidString, forHTTPHeaderField: "X-Request-ID")

        if let token = KeychainManager.shared.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidURL
        }

        if httpResponse.statusCode == 401 {
            KeychainManager.shared.clearSession()
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let errorMsg = String(data: data, encoding: .utf8) ?? "Unknown server error"
            throw APIError.httpError(statusCode: httpResponse.statusCode, code: "HTTP_\(httpResponse.statusCode)", message: errorMsg)
        }

        do {
            let decoder = JSONDecoder()
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    public func post<T: Decodable, B: Encodable>(endpoint: String, body: B) async throws -> T {
        guard let url = URL(string: endpoint, relativeTo: baseURL) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(UUID().uuidString, forHTTPHeaderField: "X-Request-ID")

        if let token = KeychainManager.shared.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        do {
            request.httpBody = try JSONEncoder().encode(body)
        } catch {
            throw APIError.encodingError(error)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidURL
        }

        if httpResponse.statusCode == 401 {
            KeychainManager.shared.clearSession()
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let errorMsg = String(data: data, encoding: .utf8) ?? "Unknown server error"
            throw APIError.httpError(statusCode: httpResponse.statusCode, code: "HTTP_\(httpResponse.statusCode)", message: errorMsg)
        }

        do {
            let decoder = JSONDecoder()
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    public func checkHealth() async -> Bool {
        do {
            let response: HealthCheckResponse = try await get(endpoint: "/health")
            return response.status == "healthy"
        } catch {
            return false
        }
    }
}
