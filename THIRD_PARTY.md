# Upstream software

The pipeline compiles unchanged AndroidX `remote-core` and `remote-creation-core`
sources downloaded at the revision in `upstream-lock.json`. They remain in the ignored
`upstream/` directory, with original copyright headers and Apache-2.0 license. The
application JAR includes AndroidX's license as `META-INF/LICENSE-androidx.txt`.

The browser proof loads the experimental TypeScript player bundled from its pinned
source checkout (Apache-2.0). It is not a reimplementation of that renderer.

Gradle dependencies and transitive versions are recorded in `pipeline/gradle.lockfile`;
Kotlin plugin version is pinned in the root build script. Browser harness
dependencies use `player-smoke/package-lock.json`; upstream player npm dependencies
use its own pinned package-lock. Preserve upstream notices when distributing built tools.

The official Node and Gradle distributions are fetched separately. Their archive
SHA-256 values are pinned by bootstrap code and Wrapper properties respectively.
