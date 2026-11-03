plugins {
    kotlin("jvm")
    application
}

repositories {
    mavenCentral()
    google()
}

// Build the unchanged upstream JVM sources in isolation from the AndroidX monorepo
// build infrastructure. Source revisions are enforced by scripts/fetch-upstreams.py.
val remoteRoot = rootProject.layout.projectDirectory.dir("upstream/androidx/compose/remote")
val upstreamDirs = listOf("remote-core", "remote-creation-core").map {
    remoteRoot.dir("$it/src/main/java")
}
val verifyUpstreams by tasks.registering(Exec::class) {
    commandLine("python3", rootProject.file("scripts/fetch-upstreams.py"), "--check")
}
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    dependsOn(verifyUpstreams)
}
tasks.withType<JavaCompile>().configureEach { dependsOn(verifyUpstreams) }
sourceSets {
    main { java.srcDirs(upstreamDirs) }
    test {
        java.srcDir(remoteRoot.dir("remote-creation-core/src/test/java"))
        java.include("**/RemoteComposeJsonParserTest.java", "**/RemoteComposeJsonParserMesh2DTest.java")
    }
}
kotlin {
    sourceSets.main { kotlin.srcDirs(upstreamDirs) }
    compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) }
}
java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}
dependencies {
    implementation("org.json:json:20231013")
    implementation("org.jspecify:jspecify:1.0.0")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.18.3")
    implementation("androidx.annotation:annotation-jvm:1.9.1")
    testImplementation("junit:junit:4.13.2")
}
application { mainClass.set("demo.pipeline.MainKt") }
tasks.test { useJUnit() }
tasks.processResources {
    dependsOn(verifyUpstreams)
    from(rootProject.file("assets")) { into("assets") }
    from(rootProject.file("upstream/androidx/LICENSE.txt")) {
        into("META-INF")
        rename { "LICENSE-androidx.txt" }
    }
}
dependencyLocking { lockAllConfigurations() }
