# Compatibility — no pair validated yet

Compiler support, protocol support, and player implementation are separate questions.
There is no tested common version/profile or operation intersection. Source references
are in [RESEARCH](RESEARCH.md); dependency pins remain null in `upstream-lock.json`.

| Feature | JVM/parser evidence | Browser | Android | iOS |
| --- | --- | --- | --- | --- |
| Layout primitives | Creation registry observed | Project reports implementation | Official player exists | C++ engine reports layout |
| Text | Parser path observed | Profile/opcode risk reported | Needs actual integration test | Font metrics/parity unmeasured |
| Canvas/paint | Commands observed | Genuine binary player documented | Official renderer | Skia bridge documented |
| Time/expression animation | Parser expressions observed | Frame/state tools documented | Runtime capability documented | Engine capability documented |
| Local interaction | onClick value-change source observed | Must inspect input path | Must test selected API | Must inspect Swift→C++ touch path |
| Host-visible events | JSON emission not established | Callback API unreviewed | Selected AndroidX callback API unreviewed | Callback ABI unreviewed |
| Images/resources | Resource subsystem observed | Loader/limits unverified | JVM→Android encoding unverified | Decode/ownership unverified |
| Patterns/macros | Registry source present | Coverage uncertain | Needs pin-specific test | Expansion gaps reported |
| Protocol versions/profiles | Header/API mechanisms exist | Exact supported set unknown | Exact supported set unknown | Exact supported set unknown |
| Built/exercised here | **No** | **No** | **No** | **No** |

The experimental status document reports missing opcodes, stubs, and remaining state
divergences. Unknown opcodes can desynchronize the stream; parsed no-ops can silently
omit content. Its layout notes also expose limitations in the headless Java text
reference. It contains internally stale statements (features listed both fixed and
missing); verify code and fixtures at a pin rather than combining those claims.
[Experiments status](https://github.com/camaelon/remotecompose-experiments/blob/main/STATUS.md)

## Verification record to produce

For every required feature, record source and binary SHA-256, upstream commits,
header/protocol/profile, operation list, dependency/tool versions, commands, rendered
screenshots, event observations, and environment. Run the same binary on each player.
Compare at fixed viewport, density, fonts and time. State equality does not prove pixels
or events match. Text needs an actual rendering reference.

Two animation candidates are a time-driven circle radius and a time-driven progress
arc. These are proposals, not working examples. Confirm shared expression operators,
clock variables, draw opcodes and invalidation before selecting them.

iOS research points to a SwiftUI host with Metal-backed Skia/C++ libraries; it is not
an official AndroidX iOS implementation. Browser rendering must use the experimental
binary player; HTML widget rendering would not meet this prototype's goal.
