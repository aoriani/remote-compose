plugins { id("com.android.application") version "9.0.0" }
repositories { google(); mavenCentral() }
android {
    namespace = "demo.remotecompose"
    compileSdk = 36
    defaultConfig { applicationId = "demo.remotecompose"; minSdk = 26; targetSdk = 36; versionCode = 1; versionName = "0.1"; testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    val remote = rootProject.file("upstream/androidx/compose/remote")
    sourceSets.getByName("main").java.srcDirs(listOf("remote-core","remote-player-core","remote-player-view").map { "$remote/$it/src/main/java" })
    lint { disable += "RestrictedApi" }
}
dependencies {
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
