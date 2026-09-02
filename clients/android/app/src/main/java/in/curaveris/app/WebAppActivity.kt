package `in`.curaveris.app

import android.net.Uri
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts

/**
 * Hosts the already-built CuraVeris web client inside the Android APK.
 * Existing native Android screens remain untouched; the launcher simply routes
 * the APK to the complete client UI already present in the repository.
 */
class WebAppActivity : ComponentActivity() {

    companion object {
        private const val WEB_APP_URL = "https://cura-veris.vercel.app/"
        private const val WEB_APP_HOST = "cura-veris.vercel.app"
    }

    private lateinit var webView: WebView
    private var fileChooserCallback: android.webkit.ValueCallback<Array<Uri>>? = null

    private val filePicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        fileChooserCallback?.onReceiveValue(uri?.let { arrayOf(it) })
        fileChooserCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            settings.mediaPlaybackRequiresUserGesture = false

            CookieManager.getInstance().setAcceptCookie(true)
            CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val target = request?.url ?: return false
                    return target.scheme != "http" && target.scheme != "https"
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: android.webkit.ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    fileChooserCallback?.onReceiveValue(null)
                    fileChooserCallback = filePathCallback
                    filePicker.launch(fileChooserParams?.acceptTypes?.firstOrNull().takeUnless { it.isNullOrBlank() } ?: "*/*")
                    return true
                }
            }
        }

        setContentView(webView)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        webView.loadUrl(resolveStartUrl(intent?.data))
    }

    override fun onNewIntent(intent: android.content.Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        webView.loadUrl(resolveStartUrl(intent?.data))
    }

    override fun onDestroy() {
        fileChooserCallback?.onReceiveValue(null)
        fileChooserCallback = null
        webView.stopLoading()
        webView.webChromeClient = null
        webView.webViewClient = null
        webView.destroy()
        super.onDestroy()
    }

    private fun resolveStartUrl(data: Uri?): String {
        if (data == null) return WEB_APP_URL

        if (data.scheme == "https" && data.host == WEB_APP_HOST) {
            return data.toString()
        }

        if (data.scheme == "https" && data.host == "app.curaveris.internal") {
            val path = data.path.orEmpty().ifBlank { "/" }
            return WEB_APP_URL.trimEnd('/') + path
        }

        if (data.scheme == "curaveris" && data.host == "audit") {
            val billId = data.lastPathSegment.orEmpty()
            if (billId.isNotBlank()) {
                return WEB_APP_URL.trimEnd('/') + "/audits?billId=" + Uri.encode(billId)
            }
        }

        return WEB_APP_URL
    }
}
