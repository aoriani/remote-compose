plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.plugin.compose")
}
repositories { google(); mavenCentral() }
android {
    namespace = "demo.remotecompose"
    compileSdk = 36
    defaultConfig { applicationId = "demo.remotecompose"; minSdk = 26; targetSdk = 36; versionCode = 1; versionName = "0.1"; testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner" }
    buildFeatures { compose = true }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    val remote = rootProject.file("upstream/androidx/compose/remote")
    sourceSets.getByName("main").java.srcDirs(listOf("remote-core","remote-player-core","remote-player-view").map { "$remote/$it/src/main/java" })
    lint { disable += "RestrictedApi" }
}
dependencies {
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation("androidx.compose.material3:material3:1.3.2")
    implementation("androidx.compose.material:material-icons-core:1.7.8")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4:1.7.8")
    debugImplementation("androidx.compose.ui:ui-test-manifest:1.7.8")
    implementation("androidx.annotation:annotation-jvm:1.9.1")
    implementation("org.jspecify:jspecify:1.0.0")
    implementation("androidx.core:core:1.15.0")
    implementation("androidx.customview:customview:1.2.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test:runner:1.6.2")
    androidTestImplementation("androidx.test:core:1.6.1")
}

dependencyLocking { lockAllConfigurations() }

val verifyMobileUpstreams by tasks.registering(Exec::class) {
    workingDir(rootProject.projectDir)
    commandLine("python3", "scripts/fetch-upstreams.py", "--check")
}
tasks.named("preBuild") { dependsOn(verifyMobileUpstreams) }
