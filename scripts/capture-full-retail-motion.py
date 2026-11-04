"""Capture real full-page native animation frames; no renderer clock or state changes."""
import concurrent.futures, json, os, pathlib, subprocess, time
root=pathlib.Path(__file__).resolve().parents[1]
out=root/'artifacts/full-retail/motion';out.mkdir(parents=True,exist_ok=True)
manifest=json.loads((root/'samples/full-retail-run.json').read_text())
adb=str(pathlib.Path(os.environ['ANDROID_HOME'])/'platform-tools/adb')
env=dict(os.environ,DEVELOPER_DIR=os.environ.get('DEVELOPER_DIR','/Applications/Xcode.app/Contents/Developer'))
sim=os.environ['IOS_SIMULATOR']
def run(args,**kw):return subprocess.run(args,check=True,env=env,**kw)
# Install the existing APK, which Gradle instrumentation may have uninstalled. No application build.
run([adb,'install','-r',str(root/'android-player/build/outputs/apk/debug/android-player-debug.apk')],stdout=subprocess.DEVNULL)
run([adb,'reverse','tcp:8092','tcp:8092'],stdout=subprocess.DEVNULL)
run([adb,'shell','am','force-stop','demo.remotecompose'])
run([adb,'shell','am','start','-n','demo.remotecompose/.MainActivity','--es','backend','http://127.0.0.1:8092','--es','version',str(manifest['version'])],stdout=subprocess.DEVNULL)
run(['xcrun','simctl','launch',sim,'demo.remotecompose.ios','--backend','http://127.0.0.1:8092','--version',str(manifest['version']),'--no-auto'],stdout=subprocess.DEVNULL)
time.sleep(5)
def capture(platform):
    folder=out/platform;folder.mkdir(exist_ok=True);records=[];start=time.monotonic()
    for i in range(32):
        path=folder/f'{i:02}.png';t=time.monotonic()-start
        if platform=='android':
            with path.open('wb') as f:run([adb,'exec-out','screencap','-p'],stdout=f)
        else:run(['xcrun','simctl','io',sim,'screenshot',str(path)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        records.append({'file':path.name,'seconds':round(t,3)});time.sleep(.10)
    return platform,records
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:records=dict(pool.map(capture,['android','ios']))
(out/'timing.json').write_text(json.dumps({'publication':manifest,'frames':records,'clock':'wall time per platform; not synchronized document phase'},indent=2))
print('Captured full-page live motion; native apps left displaying publication',manifest['version'])
