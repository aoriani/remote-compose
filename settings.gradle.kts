pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
rootProject.name = "remote-compose-prototype"
include("pipeline")
if (providers.gradleProperty("android").isPresent) include("android-player")
