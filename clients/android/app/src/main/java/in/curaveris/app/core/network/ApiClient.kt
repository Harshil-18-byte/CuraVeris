package `in`.curaveris.app.core.network

import `in`.curaveris.app.CuraVerisApplication
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.UUID
import java.util.concurrent.TimeUnit

/**
 * Resilient OkHttp Networking Client with JWT Token Injection and X-Request-ID Correlation.
 */
class ApiClient(
    private val baseUrl: String = "http://10.0.2.2:8000" // Android emulator default gateway to host
) {

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .addInterceptor { chain ->
            val original = chain.request()
            val requestId = UUID.randomUUID().toString()

            val requestBuilder = original.newBuilder()
                .header("Accept", "application/json")
                .header("X-Request-ID", requestId)

            val token = CuraVerisApplication.secureStorage.getAccessToken()
            if (!token.isNullOrEmpty() && original.header("Authorization") == null) {
                requestBuilder.header("Authorization", "Bearer $token")
            }

            val response = chain.proceed(requestBuilder.build())

            // Auto-clear session on 401 Unauthorized
            if (response.code == 401) {
                CuraVerisApplication.secureStorage.clearSession()
            }

            response
        }
        .build()

    suspend fun get(endpoint: String): Result<String> = withContext(Dispatchers.IO) {
        val url = if (endpoint.startsWith("http")) endpoint else "$baseUrl$endpoint"
        val request = Request.Builder().url(url).get().build()
        executeRequest(request)
    }

    suspend fun postJson(endpoint: String, jsonBody: String): Result<String> = withContext(Dispatchers.IO) {
        val url = if (endpoint.startsWith("http")) endpoint else "$baseUrl$endpoint"
        val body = jsonBody.toRequestBody(jsonMediaType)
        val request = Request.Builder().url(url).post(body).build()
        executeRequest(request)
    }

    suspend fun checkHealth(): Result<Boolean> = withContext(Dispatchers.IO) {
        get("/health").map { responseStr ->
            try {
                val json = JSONObject(responseStr)
                json.optString("status") == "healthy"
            } catch (e: Exception) {
                false
            }
        }
    }

    private fun executeRequest(request: Request): Result<String> {
        return try {
            client.newCall(request).execute().use { response ->
                val body = response.body?.string() ?: ""
                if (response.isSuccessful) {
                    Result.success(body)
                } else {
                    val errorMsg = try {
                        val errorJson = JSONObject(body)
                        errorJson.optJSONObject("error")?.optString("message") ?: response.message
                    } catch (e: Exception) {
                        response.message
                    }
                    Result.failure(IOException("HTTP ${response.code}: $errorMsg"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
