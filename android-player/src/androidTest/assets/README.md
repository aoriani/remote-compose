# Native renderer regression bytes

button.rc is the existing protocol HostAction42 fixture. circle.rc is the unchanged
109-byte JVM output of samples/minimal-canvas.json, reproduced by scripts/verify-pipeline.sh.
The instrumented lifecycle test serves these real bytes through HTTP, checks manual/auto
fetches, corrupt-document retention, a retained screenshot pixel, and the recovered
circle's actual RGB(0,103,160). These are renderer test assets, not client business widgets.
