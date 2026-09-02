pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    includeBuild("../mobile/node_modules/@react-native/gradle-plugin")
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = uri("../mobile/node_modules/react-native/android") }
    }
}

rootProject.name = "CuraVeris"
include(":app")
include(":react-native-safe-area-context")
project(":react-native-safe-area-context").projectDir = file("../mobile/node_modules/react-native-safe-area-context/android")
include(":react-native-screens")
project(":react-native-screens").projectDir = file("../mobile/node_modules/react-native-screens/android")
