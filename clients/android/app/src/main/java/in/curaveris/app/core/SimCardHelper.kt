package `in`.curaveris.app

import android.Manifest
import android.content.pm.PackageManager
import android.telephony.SubscriptionManager
import androidx.core.content.ContextCompat
import android.os.Build
import android.util.Log

/**
 * SimCardHelper - Reads active SIM card information using Android SubscriptionManager.
 * Used for OTP-based phone verification pre-population.
 */
class SimCardHelper(private val context: android.content.Context) {

    data class SimInfo(
        val slotIndex: Int,
        val carrierName: String,
        val displayName: String,
        val number: String,
        val subscriptionId: Int
    )

    fun getActiveSimCards(): List<SimInfo> {
        if (ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.READ_PHONE_STATE
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            Log.w("SimCardHelper", "READ_PHONE_STATE permission not granted")
            return emptyList()
        }

        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                val subscriptionManager =
                    context.getSystemService(SubscriptionManager::class.java)
                subscriptionManager?.activeSubscriptionInfoList?.map { info ->
                    SimInfo(
                        slotIndex = info.simSlotIndex,
                        carrierName = info.carrierName?.toString() ?: "",
                        displayName = info.displayName?.toString() ?: "",
                        number = info.number ?: "",
                        subscriptionId = info.subscriptionId
                    )
                } ?: emptyList()
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            Log.e("SimCardHelper", "Failed to read SIM info: ${e.message}")
            emptyList()
        }
    }
}
