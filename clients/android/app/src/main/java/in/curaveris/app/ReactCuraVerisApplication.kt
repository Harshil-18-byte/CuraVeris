package `in`.curaveris.app

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.shell.MainReactPackage
import com.facebook.soloader.SoLoader
import com.swmansion.rnscreens.RNScreensPackage
import com.th3rdwave.safeareacontext.SafeAreaContextPackage

class ReactCuraVerisApplication : Application(), ReactApplication {
    private val nativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> = listOf(
            MainReactPackage(),
            SafeAreaContextPackage(),
            RNScreensPackage()
        )

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = false

        override val isNewArchEnabled: Boolean = false
        override val isHermesEnabled: Boolean = true
    }

    override fun getReactNativeHost(): ReactNativeHost = nativeHost

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
    }
}
