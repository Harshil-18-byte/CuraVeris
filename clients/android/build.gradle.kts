plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
    id("com.facebook.react") apply false
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("../mobile/node_modules/react-native/android") }
    }
}

apply(plugin = "com.facebook.react.rootproject")
