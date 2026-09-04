plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}

val buildBaseDir = File("D:/builds/curaveris_android")
layout.buildDirectory.set(File(buildBaseDir, "root"))
subprojects {
    layout.buildDirectory.set(File(buildBaseDir, name))
}

