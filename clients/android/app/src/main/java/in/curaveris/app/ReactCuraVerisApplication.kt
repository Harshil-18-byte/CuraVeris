package `in`.curaveris.app

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class ReactCuraVerisApplication : Application(), ReactApplication {
    private val nativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> = PackageList(this).packages

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
