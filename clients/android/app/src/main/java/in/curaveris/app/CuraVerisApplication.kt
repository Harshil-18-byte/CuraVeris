package `in`.curaveris.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import `in`.curaveris.app.core.network.NetworkMonitor
import `in`.curaveris.app.core.storage.SecureStorage

/**
 * Global Application Lifecycle & Component Initializer.
 */
class CuraVerisApplication : Application() {

    companion object {
        lateinit var instance: CuraVerisApplication
            private set
        lateinit var secureStorage: SecureStorage
            private set
        lateinit var networkMonitor: NetworkMonitor
            private set

        const val CHANNEL_STATUTORY_ALERTS = "statutory_alerts"
        const val CHANNEL_AUDIT_UPDATES = "audit_updates"
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        secureStorage = SecureStorage(this)
        networkMonitor = NetworkMonitor(this)
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(NotificationManager::class.java)

            val alertChannel = NotificationChannel(
                CHANNEL_STATUTORY_ALERTS,
                "Statutory Overcharge Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Urgent alerts for NPPA price caps, DPCO violations, and emergency petitions"
            }

            val auditChannel = NotificationChannel(
                CHANNEL_AUDIT_UPDATES,
                "Bill Audit Progress",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Realtime notifications for invoice OCR extraction and reconciliation completion"
            }

            notificationManager.createNotificationChannel(alertChannel)
            notificationManager.createNotificationChannel(auditChannel)
        }
    }
}
