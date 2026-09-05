package in.curaveris.app

import android.Manifest
import android.content.pm.PackageManager
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.Arguments

class SimCardModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SimCardModule"

    @ReactMethod
    fun getSimCards(promise: Promise) {
        try {
            val context = reactApplicationContext

            if (ContextCompat.checkSelfPermission(
                    context,
                    Manifest.permission.READ_PHONE_STATE
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                promise.reject("PERMISSION_DENIED", "READ_PHONE_STATE permission not granted")
                return
            }

            val subscriptionManager = context
                .getSystemService(SubscriptionManager::class.java)

            val result: WritableArray = Arguments.createArray()

            subscriptionManager?.activeSubscriptionInfoList?.forEach { info ->
                val simMap = Arguments.createMap()
                simMap.putInt("slotIndex", info.simSlotIndex)
                simMap.putString("carrierName", info.carrierName?.toString() ?: "")
                simMap.putString("displayName", info.displayName?.toString() ?: "")
                simMap.putString("number", info.number ?: "")
                simMap.putInt("subscriptionId", info.subscriptionId)
                result.pushMap(simMap)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("SIM_ERROR", e.message ?: "Failed to read SIM information")
        }
    }
}
