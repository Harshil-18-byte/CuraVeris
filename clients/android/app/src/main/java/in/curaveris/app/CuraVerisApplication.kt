package `in`.curaveris.app

import android.app.Application
import `in`.curaveris.app.core.network.NetworkMonitor
import `in`.curaveris.app.core.storage.SecureStorage

class CuraVerisApplication : Application() {

    companion object {
        const val CHANNEL_STATUTORY_ALERTS = "statutory_alerts"
        lateinit var instance: CuraVerisApplication
            private set
        val secureStorage: SecureStorage by lazy { SecureStorage(instance) }
        val networkMonitor: NetworkMonitor by lazy { NetworkMonitor(instance) }
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
    }
}
