# Kotlin HTTP backend

Build with `sh scripts/gradle.sh :pipeline:installDist`, then run from the repository root
with JAVA_HOME exported:

```sh
pipeline/build/install/pipeline/bin/pipeline serve 8080 data/documents
```

Default bind is 127.0.0.1. Set RC_BIND_HOST for device/LAN access; RC_PROJECT_ROOT can
select the checked-out project when launching elsewhere. Storage path is configurable.

- POST /api/compile: raw primitive JSON; binary response. Never publishes.
- POST /api/publish: raw primitive JSON; 201 metadata and a new immutable version.
- GET /api/documents/latest: binary, ETag, X-Document-Version and X-Document-SHA256.
- GET /api/documents/latest/metadata: version, header, size, SHA, compiler revision, timestamp.
- GET /api/documents/latest/source: exact original source, for editor recovery.
- Replace latest with a positive version to fetch an immutable historical version.

No published version returns 404. Malformed JSON returns 400; unsupported/invalid
primitive input returns 422 with errors [{code,path,message}]. Paths use JSON Pointer.
Only the explicit subset in Validation.kt is enabled. Limits: 1 MiB, nesting 64.
Compiler errors retain upstream context. The legacy compiler CLI remains unfiltered
for research; service requests always use strict validation.

Versions are atomic source/binary/metadata bundles. Failed validation/compilation leaves
publication untouched. Temp files are ignored after crashes; committed versions survive
restart. This backend has no authentication and is intended for a local demonstration.

The editor/player files are served by the same Kotlin process. No web build framework or
business component registry is required by the runtime. Image/feature support is
expanded only with corresponding tests; see COMPATIBILITY.
