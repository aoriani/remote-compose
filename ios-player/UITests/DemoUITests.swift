import XCTest

/// Drives installed generic viewer through real Simulator input; no renderer test hooks.
final class DemoUITests: XCTestCase {
    func testLandingInteractionAndNativeDebug() throws {
        let app = XCUIApplication(bundleIdentifier: "demo.remotecompose.ios")
        app.launch()
        let surface = app.otherElements["remote-document"].firstMatch
        XCTAssertTrue(surface.waitForExistence(timeout: 15))
        let status = app.staticTexts["fetch-status"]
        let loaded = NSPredicate(format: "label CONTAINS 'bytes' AND NOT label CONTAINS '0 bytes'")
        expectation(for: loaded, evaluatedWith: status)
        waitForExpectations(timeout: 20)
        let before = XCTAttachment(screenshot: app.screenshot()); before.name = "iOS landing before interaction"; before.lifetime = .keepAlways; add(before)
        let frame = surface.frame
        let scale = min(frame.width / 390, frame.height / 844)
        let x = frame.width / 2
        let y = (frame.height - 844 * scale) / 2 + 296 * scale
        surface.coordinate(withNormalizedOffset: CGVector(dx: x / frame.width, dy: y / frame.height)).tap()
        app.buttons["Debug"].tap()
        let clear = app.buttons["Clear event log"]
        for _ in 0..<10 {
            if clear.isHittable { break }
            app.swipeUp()
        }
        let event = app.staticTexts.matching(NSPredicate(format: "label CONTAINS 'id=42'")).firstMatch
        XCTAssertTrue(event.waitForExistence(timeout: 5), "Real canvas tap should reach the C++ host callback and native log")
        let after = XCTAttachment(screenshot: app.screenshot()); after.name = "iOS native event log"; after.lifetime = .keepAlways; add(after)
        clear.tap()
        XCTAssertFalse(event.exists)
        app.buttons["Done"].tap()
        func coordinate(_ x: CGFloat, _ y: CGFloat) -> XCUICoordinate {
            surface.coordinate(withNormalizedOffset: CGVector(dx: ((frame.width-390*scale)/2+x*scale)/frame.width, dy: ((frame.height-844*scale)/2+y*scale)/frame.height))
        }
        coordinate(300,600).press(forDuration:0.1,thenDragTo:coordinate(50,600))
        let horizontal = XCTAttachment(screenshot:app.screenshot());horizontal.name="iOS horizontal carousel after drag";horizontal.lifetime = .keepAlways;add(horizontal)
        coordinate(340,750).press(forDuration:0.1,thenDragTo:coordinate(340,250))
        let vertical = XCTAttachment(screenshot:app.screenshot());vertical.name="iOS vertical page after drag";vertical.lifetime = .keepAlways;add(vertical)
        coordinate(195,820).tap()
        app.buttons["Debug"].tap()
        let customEvent=app.staticTexts.matching(NSPredicate(format:"label CONTAINS 'id=99'")).firstMatch
        for _ in 0..<10 { if customEvent.exists { break };app.swipeUp() }
        XCTAssertTrue(customEvent.waitForExistence(timeout:5),"Custom primitive click should reach the same generic host callback")
        let customLog=XCTAttachment(screenshot:app.screenshot());customLog.name="iOS custom event99";customLog.lifetime = .keepAlways;add(customLog)
        app.buttons["Done"].tap()
    }
}
