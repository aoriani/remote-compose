import XCTest

/// Drives installed generic viewer through real Simulator input; no renderer test hooks.
final class DemoUITests: XCTestCase {
    func testLandingInteractionAndNativeDebug() throws {
        func requestJSON(_ path:String) -> [String:Any] {
            let done=expectation(description:path);var result:[String:Any]=[:]
            URLSession.shared.dataTask(with:URL(string:"http://127.0.0.1:8080"+path)!){data,_,_ in
                if let data,let json=try? JSONSerialization.jsonObject(with:data) as? [String:Any]{result=json};done.fulfill()
            }.resume();wait(for:[done],timeout:15);return result
        }
        let metadata=requestJSON("/api/documents/latest/metadata")
        let version=(metadata["version"] as? NSNumber)?.stringValue ?? "latest"
        let source=requestJSON("/api/documents/\(version)/source")
        func containsCustomAction(_ node:Any)->Bool {
            if let n=node as? [String:Any] {if n["actionId"] as? Int == 99{return true};return n.values.contains(where:containsCustomAction)}
            if let n=node as? [Any] {return n.contains(where:containsCustomAction)};return false
        }
        let customAction=containsCustomAction(source)
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
        let scale: CGFloat = 1
        let x = frame.width / 2
        let y: CGFloat = 296
        surface.coordinate(withNormalizedOffset: CGVector(dx: x / frame.width, dy: y / frame.height)).tap()
        app.buttons["Debug"].tap()
        if let digest=metadata["sha256"] as? String {
            let identity=app.staticTexts.matching(NSPredicate(format:"label CONTAINS %@",String(digest.prefix(16)))).firstMatch
            for _ in 0..<4 { if identity.exists { break };app.swipeUp() }
            XCTAssertTrue(identity.waitForExistence(timeout:5),"Published digest prefix must match the loaded document")
        }
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
            surface.coordinate(withNormalizedOffset: CGVector(dx: x/frame.width, dy: y/frame.height))
        }
        coordinate(300,600).press(forDuration:0.1,thenDragTo:coordinate(50,600))
        let horizontal = XCTAttachment(screenshot:app.screenshot());horizontal.name="iOS horizontal carousel after drag";horizontal.lifetime = .keepAlways;add(horizontal)
        coordinate(340,750).press(forDuration:0.1,thenDragTo:coordinate(340,250))
        let vertical = XCTAttachment(screenshot:app.screenshot());vertical.name="iOS vertical page after drag";vertical.lifetime = .keepAlways;add(vertical)
        if customAction {
        coordinate(195,820).tap()
        app.buttons["Debug"].tap()
        let customEvent=app.staticTexts.matching(NSPredicate(format:"label CONTAINS 'id=99'")).firstMatch
        for _ in 0..<10 { if customEvent.exists { break };app.swipeUp() }
        XCTAssertTrue(customEvent.waitForExistence(timeout:5),"Custom primitive click should reach the same generic host callback")
        let customLog=XCTAttachment(screenshot:app.screenshot());customLog.name="iOS custom event99";customLog.lifetime = .keepAlways;add(customLog)
        app.buttons["Done"].tap()
        }
    }
    /// Immutable versions published once by the browser suite, never recompiled by a client.
    func testValidationGallery() throws {
        executionTimeAllowance=900
        let base="http://127.0.0.1:8091"
        func json(_ path:String)->[String:Any]{
            let done=expectation(description:path);var result:[String:Any]=[:]
            URLSession.shared.dataTask(with:URL(string:base+path)!){data,_,_ in if let data,let value=try? JSONSerialization.jsonObject(with:data) as? [String:Any]{result=value};done.fulfill()}.resume()
            wait(for:[done],timeout:20);return result
        }
        let manifest=json("/samples/validation/run.json")
        guard let cases=manifest["cases"] as? [[String:Any]],!cases.isEmpty else{XCTFail("Validation manifest unavailable");return}
        for item in cases {
            guard let id=item["id"] as? String,let version=item["version"] as? Int,let digest=item["sha256"] as? String else{continue}
            try XCTContext.runActivity(named:id){_ in
                let app=XCUIApplication(bundleIdentifier:"demo.remotecompose.ios")
                app.launchArguments=["--backend",base,"--version",String(version)];app.launch()
                let surface=app.otherElements["remote-document"].firstMatch
                XCTAssertTrue(surface.waitForExistence(timeout:15),id)
                let ready=NSPredicate(format:"label CONTAINS %@","v\(version) •")
                let wait=XCTNSPredicateExpectation(predicate:ready,object:app.staticTexts["fetch-status"])
                guard XCTWaiter.wait(for:[wait],timeout:20) == .completed else{XCTFail("\(id) version not rendered");app.terminate();return}
                func point(_ x:CGFloat,_ y:CGFloat)->XCUICoordinate{let f=surface.frame;return surface.coordinate(withNormalizedOffset:CGVector(dx:x/f.width,dy:y/f.height))}
                func shot(_ suffix:String){
                    let screenshot=app.screenshot();let full=XCTAttachment(screenshot:screenshot);full.name=id+"__"+suffix+"-full";full.lifetime = .keepAlways;add(full)
                    let f=surface.frame,image=screenshot.image,ratio=CGFloat(image.cgImage!.width)/image.size.width
                    let rect=CGRect(x:f.minX*ratio,y:f.minY*ratio,width:f.width*ratio,height:f.height*ratio).integral
                    if let cropped=image.cgImage?.cropping(to:rect){let a=XCTAttachment(image:UIImage(cgImage:cropped));a.name=id+"__"+suffix;a.lifetime = .keepAlways;add(a)}else{XCTFail("\(id): viewport crop failed")}
                }
                func debug(){app.buttons["Debug"].tap();let identity=app.staticTexts["document-digest"];for _ in 0..<5{if identity.exists{break};app.swipeUp()};XCTAssertTrue(identity.waitForExistence(timeout:3),"\(id) digest missing");if identity.exists{XCTAssertEqual(identity.value as? String,digest,"\(id) exact published hash mismatch")}}
                debug();app.buttons["Done"].tap();shot("before")
                if let plan=item["plan"] as? [String:Any]{
                    if plan["live"] as? Bool == true{Thread.sleep(forTimeInterval:0.55);shot("live")}
                    if let actions=plan["actions"] as? [[String:Any]]{
                        for a in actions {point(CGFloat(a["x"] as? Double ?? 150),CGFloat(a["y"] as? Double ?? 95)).tap()}
                        shot("after")
                        debug()
                        let named=app.staticTexts.matching(NSPredicate(format:"label CONTAINS 'validation.echo'")).firstMatch
                        for _ in 0..<10{if named.exists{break};app.swipeUp()}
                        XCTAssertTrue(named.waitForExistence(timeout:3),"Named event missing")
                        if named.exists{XCTAssertTrue(named.label.contains("hello-protocol"),"Named event payload changed")}
                        let idEvent=app.staticTexts.matching(NSPredicate(format:"label CONTAINS 'id=501'")).firstMatch
                        XCTAssertTrue(idEvent.exists,"ID event missing")
                        let log=XCTAttachment(screenshot:app.screenshot());log.name=id+"__events";log.lifetime = .keepAlways;add(log);app.buttons["Done"].tap()
                    }
                    if id == "retail"{XCUIDevice.shared.orientation = .landscapeLeft;Thread.sleep(forTimeInterval:1);shot("landscape");XCUIDevice.shared.orientation = .portrait}
                    if plan["scroll"] as? Bool == true{point(300,600).press(forDuration:0.1,thenDragTo:point(50,600));shot("horizontal");point(340,750).press(forDuration:0.1,thenDragTo:point(340,250));shot("scroll")}
                }
                app.terminate()
            }
        }
    }

    /// Real latest publication, native Refresh, auto-refresh and offline recovery.
    func testValidationLifecycle() throws {
        let base="http://127.0.0.1:8091"
        func request(_ path:String,_ body:Data?=nil)->(Int,Data){
            let done=expectation(description:path);var output=(0,Data());var request=URLRequest(url:URL(string:base+path)!);if let body{request.httpMethod="POST";request.httpBody=body;request.setValue("application/json",forHTTPHeaderField:"Content-Type")}
            URLSession.shared.dataTask(with:request){data,response,_ in output=((response as? HTTPURLResponse)?.statusCode ?? 0,data ?? Data());done.fulfill()}.resume();wait(for:[done],timeout:20);return output
        }
        func metadata()->[String:Any]{let response=request("/api/documents/latest/metadata");return (try? JSONSerialization.jsonObject(with:response.1) as? [String:Any]) ?? [:]}
        func source(_ color:String)->Data{Data("{\"header\":{\"width\":390,\"height\":844,\"profiles\":512},\"root\":{\"type\":\"canvas\",\"modifiers\":[{\"fillMaxSize\":1}],\"commands\":[{\"type\":\"paint\",\"ops\":[{\"color\":\"#FFFFFF\"}]},{\"type\":\"drawRect\",\"left\":0,\"top\":0,\"right\":390,\"bottom\":844},{\"type\":\"paint\",\"ops\":[{\"color\":\"\(color)\"}]},{\"type\":\"drawCircle\",\"cx\":195,\"cy\":200,\"radius\":80}]}}".utf8)}
        let app=XCUIApplication(bundleIdentifier:"demo.remotecompose.ios");app.launchArguments=["--backend",base,"--no-auto","--interval","2"];app.launch()
        let surface=app.otherElements["remote-document"].firstMatch;XCTAssertTrue(surface.waitForExistence(timeout:15))
        func waitVersion(_ n:Int){let wait=XCTNSPredicateExpectation(predicate:NSPredicate(format:"label CONTAINS %@","v\(n) •"),object:app.staticTexts["fetch-status"]);XCTAssertEqual(XCTWaiter.wait(for:[wait],timeout:20),.completed)}
        func digest(_ expected:String){app.buttons["Debug"].tap();let element=app.staticTexts["document-digest"];for _ in 0..<6{if element.exists{break};app.swipeUp()};XCTAssertEqual(element.value as? String,expected);app.buttons["Done"].tap()}
        func shot(_ id:String){let screenshot=app.screenshot(),f=surface.frame,im=screenshot.image,ratio=CGFloat(im.cgImage!.width)/im.size.width;let rect=CGRect(x:f.minX*ratio,y:f.minY*ratio,width:f.width*ratio,height:f.height*ratio).integral;if let crop=im.cgImage?.cropping(to:rect){let a=XCTAttachment(image:UIImage(cgImage:crop));a.name=id+"__before";a.lifetime = .keepAlways;add(a)}}
        let old=metadata(),oldVersion=old["version"] as! Int;waitVersion(oldVersion)
        XCTAssertEqual(request("/api/compile",source("#305BEF")).0,200);XCTAssertEqual(metadata()["version"] as? Int,oldVersion)
        XCTAssertGreaterThanOrEqual(request("/api/publish",Data("{".utf8)).0,400);XCTAssertEqual(metadata()["version"] as? Int,oldVersion)
        XCTAssertEqual(request("/api/publish",source("#305BEF")).0,201);let a=metadata();Thread.sleep(forTimeInterval:2.2)
        XCTAssertTrue(app.staticTexts["fetch-status"].label.contains("v\(oldVersion) •"),"Unpublished/disabled-auto draft must not replace loaded document")
        app.buttons["Refresh"].tap();waitVersion(a["version"] as! Int);digest(a["sha256"] as! String);shot("lifecycle-a")
        app.buttons["Debug"].tap();let toggle=app.switches["Auto-refresh"];for _ in 0..<6{if toggle.isHittable{break};app.swipeDown()};toggle.coordinate(withNormalizedOffset:CGVector(dx:0.9,dy:0.5)).tap();XCTAssertEqual(toggle.value as? String,"1","Actual auto-refresh switch must turn on");let enabled=XCTAttachment(screenshot:app.screenshot());enabled.name="lifecycle-auto-enabled";enabled.lifetime = .keepAlways;add(enabled);app.buttons["Done"].tap()
        XCTAssertEqual(request("/api/publish",source("#00827E")).0,201);let b=metadata();waitVersion(b["version"] as! Int);digest(b["sha256"] as! String);shot("lifecycle-b")
        app.buttons["Debug"].tap();for _ in 0..<6{if app.textFields["Backend URL"].isHittable{break};app.swipeDown()};app.switches["Auto-refresh"].coordinate(withNormalizedOffset:CGVector(dx:0.9,dy:0.5)).tap()
        func backend(_ url:String){let field=app.textFields["Backend URL"];field.tap();field.typeText(String(repeating:XCUIKeyboardKey.delete.rawValue,count:100)+url);app.buttons["Refresh now"].tap()}
        backend("http://127.0.0.1:1")
        let failed=app.staticTexts.matching(NSPredicate(format:"label CONTAINS 'Refresh failed'")).firstMatch;XCTAssertTrue(failed.waitForExistence(timeout:15));XCTAssertEqual(app.staticTexts["document-digest"].value as? String,b["sha256"] as? String)
        let offline=XCTAttachment(screenshot:app.screenshot());offline.name="lifecycle-offline-retained";offline.lifetime = .keepAlways;add(offline);app.buttons["Done"].tap();shot("lifecycle-retained");app.buttons["Debug"].tap()
        for _ in 0..<6{if app.textFields["Backend URL"].isHittable{break};app.swipeDown()};backend(base);app.buttons["Done"].tap();waitVersion(b["version"] as! Int);let recovered=XCTNSPredicateExpectation(predicate:NSPredicate(format:"NOT label CONTAINS 'failed' AND NOT label CONTAINS 'Fetching'"),object:app.staticTexts["fetch-status"]);XCTAssertEqual(XCTWaiter.wait(for:[recovered],timeout:15),.completed,"Must observe a successful recovery response, not just retained metadata");digest(b["sha256"] as! String);app.terminate()
    }

    func testNativeViewport() throws {
        let base="http://127.0.0.1:8080",done=expectation(description:"publication manifest");var manifest:[String:Any]=[:]
        URLSession.shared.dataTask(with:URL(string:base+"/samples/native-layout-run.json")!){data,_,_ in if let data{manifest=(try? JSONSerialization.jsonObject(with:data) as? [String:Any]) ?? [:]};done.fulfill()}.resume();wait(for:[done],timeout:15)
        guard let cases=manifest["cases"] as? [[String:Any]],cases.count==3 else{XCTFail("Generate/publish the viewport fixtures first");return}
        for item in cases {
            let id=item["id"] as! String,version=item["version"] as! Int,digest=item["sha256"] as! String
            let app=XCUIApplication(bundleIdentifier:"demo.remotecompose.ios");app.launchArguments=["--backend",base,"--version",String(version)];app.launch()
            let surface=app.otherElements["remote-document"].firstMatch;XCTAssertTrue(surface.waitForExistence(timeout:15))
            let ready=XCTNSPredicateExpectation(predicate:NSPredicate(format:"label CONTAINS %@","v\(version) •"),object:app.staticTexts["fetch-status"]);XCTAssertEqual(XCTWaiter.wait(for:[ready],timeout:20),.completed)
            let viewport=surface.frame;XCTAssertEqual(viewport.minX,app.frame.minX,accuracy:1);XCTAssertEqual(viewport.width,app.frame.width,accuracy:1,"Whole safe portrait viewport must be used")
            func point(_ x:CGFloat,_ y:CGFloat)->XCUICoordinate{surface.coordinate(withNormalizedOffset:CGVector(dx:x/surface.frame.width,dy:y/surface.frame.height))}
            func shot(_ suffix:String){let screenshot=app.screenshot(),f=surface.frame,ratio=CGFloat(screenshot.image.cgImage!.width)/app.frame.width;let full=XCTAttachment(screenshot:screenshot);full.name=id+"__"+suffix+"-full";full.lifetime = .keepAlways;add(full);let metrics="{\"id\":\"\(id)\",\"sha256\":\"\(digest)\",\"x\":\(f.minX),\"y\":\(f.minY),\"width\":\(f.width),\"height\":\(f.height),\"density\":\(ratio),\"screenWidth\":\(app.frame.width),\"screenHeight\":\(app.frame.height)}";let record=XCTAttachment(string:metrics);record.name=id+"__geometry";record.lifetime = .keepAlways;add(record);if let cropped=screenshot.image.cgImage?.cropping(to:CGRect(x:f.minX*ratio,y:f.minY*ratio,width:f.width*ratio,height:f.height*ratio).integral){let body=XCTAttachment(image:UIImage(cgImage:cropped));body.name=id+"__"+suffix;body.lifetime = .keepAlways;add(body)}}
            app.buttons["Refresh"].tap();let unchanged=XCTNSPredicateExpectation(predicate:NSPredicate(format:"label CONTAINS 'Unchanged'"),object:app.staticTexts["fetch-status"]);XCTAssertEqual(XCTWaiter.wait(for:[unchanged],timeout:15),.completed)
            app.buttons["Debug"].tap();let identity=app.staticTexts["document-digest"];for _ in 0..<6{if identity.exists{break};app.swipeUp()};XCTAssertEqual(identity.value as? String,digest);app.buttons["Done"].tap();shot("before")
            if id=="viewport-layout"{point(100,80).tap();app.buttons["Debug"].tap();let event=app.staticTexts.matching(NSPredicate(format:"label CONTAINS 'id=501'")).firstMatch;for _ in 0..<8{if event.exists{break};app.swipeUp()};XCTAssertTrue(event.exists);app.buttons["Done"].tap()}
            if id=="retail-home"{let y=min(surface.frame.height-40,550);point(surface.frame.width*0.9,y).press(forDuration:0.1,thenDragTo:point(surface.frame.width*0.9,y-200),withVelocity:.slow,thenHoldForDuration:0.3);shot("horizontal-before");point(300,430).press(forDuration:0.1,thenDragTo:point(60,430),withVelocity:.slow,thenHoldForDuration:0.3);shot("horizontal")}
            let f=surface.frame;point(f.width*0.85,f.height*0.85).press(forDuration:0.1,thenDragTo:point(f.width*0.85,f.height*0.3));shot("scroll")
            app.terminate()
        }
    }

    func testInteractiveRetail() throws {
        let base="http://127.0.0.1:8092",done=expectation(description:"interactive manifest");var manifest:[String:Any]=[:]
        URLSession.shared.dataTask(with:URL(string:base+"/samples/interactive-run.json")!){data,_,_ in if let data{manifest=(try? JSONSerialization.jsonObject(with:data) as? [String:Any]) ?? [:]};done.fulfill()}.resume();wait(for:[done],timeout:15)
        guard let cases=manifest["cases"] as? [[String:Any]],cases.count==3 else{XCTFail("Run browser interactive lifecycle first");return}
        for (index,item) in cases.enumerated() {
            let id=item["id"] as! String,version=item["version"] as! Int,digest=item["sha256"] as! String
            let app=XCUIApplication(bundleIdentifier:"demo.remotecompose.ios");app.launchArguments=["--backend",base,"--version",String(version),"--no-auto"];app.launch()
            let surface=app.otherElements["remote-document"].firstMatch;XCTAssertTrue(surface.waitForExistence(timeout:15))
            let ready=XCTNSPredicateExpectation(predicate:NSPredicate(format:"label CONTAINS %@","v\(version) •"),object:app.staticTexts["fetch-status"]);XCTAssertEqual(XCTWaiter.wait(for:[ready],timeout:20),.completed)
            func point(_ x:CGFloat,_ y:CGFloat)->XCUICoordinate{surface.coordinate(withNormalizedOffset:CGVector(dx:x/surface.frame.width,dy:y/surface.frame.height))}
            func shot(_ name:String){let a=XCTAttachment(screenshot:app.screenshot());a.name=id+"__"+name;a.lifetime = .keepAlways;add(a)}
            func action(_ x:CGFloat,_ y:CGFloat,_ expected:String){
                point(x,y).tap();let notice=app.buttons.matching(NSPredicate(format:"label BEGINSWITH 'Host action:'")).firstMatch
                XCTAssertTrue(notice.waitForExistence(timeout:3));XCTAssertTrue(notice.label.contains(expected),"Expected \(expected), actual \(notice.label)");print("INTERACTIVE_EVENT \(notice.label)");if notice.exists{notice.tap()}
            }
            shot("initial")
            if index==2 {
                let w=surface.frame.width
                action(w-44,286,"carousel.next");Thread.sleep(forTimeInterval:0.6);action(100,80,"promotion.open")
                action(44,286,"carousel.previous");Thread.sleep(forTimeInterval:0.6);action(100,80,"promotion.open")
                action(w/2+44,286,"carousel.select");Thread.sleep(forTimeInterval:0.6);action(100,80,"promotion.open")
                Thread.sleep(forTimeInterval:5.2);action(100,80,"promotion.open");shot("automatic")
                action(48,594,"favorite.change type=0 value=1.");action(48,594,"favorite.change type=0 value=0.")
                action(164,392,"category.select type=2 value=Breakfast");action(268,392,"category.select type=2 value=Pantry")
                action(w-44,594,"cart.add type=0 value=1.");action(w-44,594,"cart.add type=0 value=2.");action(w-140,594,"cart.quantity type=0 value=1.")
                action(70,470,"product.open type=2 value=field-oat");action(80,646,"scan.open type=2 value=scan-and-go");action(100,695,"membership.open type=2 value=common-market");shot("local-state")
                app.buttons["Debug"].tap()
                let logs=app.staticTexts.matching(NSPredicate(format:"label CONTAINS 'name='"));for _ in 0..<5{app.swipeUp()}
                print("INTERACTIVE_LOG \(logs.allElementsBoundByIndex.map{$0.label})")
                for _ in 0..<8{if app.staticTexts["event-count"].exists{break};app.swipeDown()};XCTAssertEqual(app.staticTexts["event-count"].label,"Events: 17","No duplicate or missing callbacks")
                app.buttons["Done"].tap()
            }
            app.buttons["Debug"].tap();let hash=app.staticTexts["document-digest"];for _ in 0..<6{if hash.exists{break};app.swipeUp()};XCTAssertEqual(hash.value as? String,digest);shot("digest");app.buttons["Done"].tap()
            if index != 2 {action(100,80,"promotion.open")}
            if index==2 {XCUIDevice.shared.press(.home);Thread.sleep(forTimeInterval:5.2);app.activate();let stable=XCTNSPredicateExpectation(predicate:NSPredicate{_,_ in surface.exists && abs(surface.frame.width-app.frame.width)<1 && surface.frame.height>650},object:surface);XCTAssertEqual(XCTWaiter.wait(for:[stable],timeout:10),.completed);Thread.sleep(forTimeInterval:0.5);action(surface.frame.width-44,594,"cart.add type=0 value=2.");shot("resume")}
            print("INTERACTIVE_DOCUMENT \(id) sha256=\(digest)");app.terminate()
        }
    }

    func testInteractiveVisualState() throws {
        let base="http://127.0.0.1:8092",done=expectation(description:"visual manifest");var manifest:[String:Any]=[:]
        URLSession.shared.dataTask(with:URL(string:base+"/samples/interactive-run.json")!){data,_,_ in if let data{manifest=(try? JSONSerialization.jsonObject(with:data) as? [String:Any]) ?? [:]};done.fulfill()}.resume();wait(for:[done],timeout:15)
        let item=(manifest["cases"] as! [[String:Any]]).last!,version=item["version"] as! Int
        let app=XCUIApplication(bundleIdentifier:"demo.remotecompose.ios");app.launchArguments=["--backend",base,"--version",String(version),"--no-auto"];app.launch()
        let surface=app.otherElements["remote-document"].firstMatch;XCTAssertTrue(surface.waitForExistence(timeout:15))
        let ready=XCTNSPredicateExpectation(predicate:NSPredicate(format:"label CONTAINS %@","v\(version) •"),object:app.staticTexts["fetch-status"]);XCTAssertEqual(XCTWaiter.wait(for:[ready],timeout:20),.completed)
        func point(_ x:CGFloat,_ y:CGFloat)->XCUICoordinate{surface.coordinate(withNormalizedOffset:CGVector(dx:x/surface.frame.width,dy:y/surface.frame.height))}
        func heart()->Data?{let im=app.screenshot().image,r=CGFloat(im.cgImage!.width)/app.frame.width,f=surface.frame;return im.cgImage?.cropping(to:CGRect(x:30*r,y:(f.minY+578)*r,width:36*r,height:36*r).integral).flatMap{UIImage(cgImage:$0).pngData()}}
        let before=heart();point(48,594).tap();Thread.sleep(forTimeInterval:0.3);let after=heart();XCTAssertNotEqual(before,after,"Favorite must visibly change, not merely emit a host event")
        let a=XCTAttachment(screenshot:app.screenshot());a.name="interactive__favorite-selected";a.lifetime = .keepAlways;add(a)
        let notice=app.buttons.matching(NSPredicate(format:"label BEGINSWITH 'Host action:'")).firstMatch;XCTAssertTrue(notice.label.contains("favorite.change type=0 value=1."));notice.tap()
        app.terminate()
    }

}
