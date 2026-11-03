# Future reuse and caching investigation

Research only. No caching optimization is implemented or proposed for the initial POC.

## Confirmed in indexed source, not executed

The creation component registry at fa07a37 implements `definepattern`,
`patternargument`, and `patterninflation`. Definitions allocate parameter IDs, save
the parser variable map, parse a body, then restore scope. Named calls resolve arguments
to IDs and emit inflation; there are also block/foreach forms. This indicates encoded
definition/call mechanisms, not merely copying source objects. It does not establish
working expansion in every player.
[Registry source](https://android.googlesource.com/platform/frameworks/support/+/fa07a37857e71e91427b7d68ec6b6f7f2931000a/compose/remote/remote-creation-core/src/main/java/androidx/compose/remote/creation/json/DefaultComponentParsers.java)

## Distinguish four levels

| Level | Potential design | What remains unproven |
| --- | --- | --- |
| Source reuse | Editor expands shared primitive templates before normal compilation | ID hygiene and deterministic expansion |
| Binary reuse | Cache encoded definitions/fragments and assemble a document | Relocation, opcode boundaries, header/versions, resource IDs, nesting |
| Parameterization | Pattern arguments reference document variables/resources | Argument typing, scope, nested inflation and update semantics |
| Runtime reuse | Player caches resources/expanded content | Lifetime, eviction, invalidation and cross-document namespace rules |

## Constraints and assumptions

Do not concatenate arbitrary binary documents. A header, document-scoped ID allocation,
resource references, global ordering, block boundaries and version maps may make
fragments dependent on their compilation context. Even numeric-looking values may
encode IDs in float NaNs. A fragment cache needs a verified relocation strategy or a
shared symbol table; neither has been established.

In-document local variables can plausibly update without full recompilation; that
does not establish a server-to-client variable patch protocol, externally writable
variables in every player, or persistent resource caches across documents.

## Recommended experiments after core POC

1. Compile a tiny parameterized pattern and equivalent expanded source. Decode operations
   and compare rendering/state on all three players.
2. Instantiate twice with distinct arguments; test nested locals and deliberate ID collisions.
3. Change a local value and separately exercise any documented host setter; record whether
   layout/drawing invalidation occurs and whether the document bytes change.
4. Attempt controlled fragment relocation with strings, images, paths and expressions;
   require decoded reference correctness before performance claims.
5. Measure compilation CPU, binary size, transport bytes and first/steady render latency.
   Compare whole-document caching, source template reuse and encoded patterns.
6. Design cache keys from source hash, compiler revision, protocol/profile, resources and
   parameters. Test invalidation and resource release under repeated document replacement.

Simplest future option: whole-document content-addressed caching plus immutable version
delivery. It avoids unproven fragment assembly and should be the baseline against which
more complicated schemes are measured. This remains a future design recommendation.
