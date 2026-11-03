# Primitive fixtures

minimal-canvas.json remains the 109-byte original verified JVM/browser baseline.
landing.json exercises editor templates and actual PNG resources. animations.json is
556 bytes and both expression animations were observed in browser, Android and iOS.
interaction.json is 190 bytes and host event 42 was observed in all three engines.
custom-composition.json is an uncatalogued nested composition: 932 bytes,
SHA-256 3ea80866c330a6f27b827ec964b4d86909fa1b77cafc3926e241b9e047a7d871.
It rendered in all three players while installed mobile application hashes stayed fixed.
See docs/evidence and docs/COMPATIBILITY.md for the measured scope and exclusions.

demo-landing.json combines the corrected landing with uncatalogued custom sections to
exercise vertical scrolling and event 99. All three players rendered its 4,163-byte binary,
SHA-256 7dd683f3de2b007b9b307799cf9128536b0de8b0da47c006819a15711b546d63.
Use this exact fixture for the iOS XCTest UI target; see GETTING_STARTED.
