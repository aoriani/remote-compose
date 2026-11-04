#!/usr/bin/env python3
"""Publish through real browser UI while both unchanged native apps are running."""
import os, pathlib, subprocess, json, time, hashlib, urllib.request, re, sys
root=pathlib.Path(__file__).resolve().parents[1];os.chdir(root)
folder=root/'artifacts/interactive';folder.mkdir(parents=True,exist_ok=True)
env=os.environ.copy();env.setdefault('DEVELOPER_DIR','/Applications/Xcode.app/Contents/Developer')
adb=str(pathlib.Path(env['ANDROID_HOME'])/'platform-tools/adb');device=env['IOS_SIMULATOR']
def run(args,**kwargs):return subprocess.check_output(args,env=env,**kwargs)
def sha(data):return hashlib.sha256(data).hexdigest()
def latest():return json.load(urllib.request.urlopen('http://127.0.0.1:8092/api/documents/latest/metadata'))
def installed():
 apk=run([adb,'shell','pm','path','demo.remotecompose'],text=True).strip().split('package:')[-1]
 ios=run(['xcrun','simctl','get_app_container',device,'demo.remotecompose.ios','app'],text=True).strip()
 return {'android':sha(run([adb,'exec-out','cat',apk])),'ios':sha((pathlib.Path(ios)/'RemoteCompose').read_bytes())}
before=latest();print('Starting native apps at published version',before['version'],flush=True)
run([adb,'reverse','tcp:8092','tcp:8092']);run([adb,'install','-r','android-player/build/outputs/apk/debug/android-player-debug.apk'])
run([adb,'shell','am','force-stop','demo.remotecompose']);run([adb,'shell','am','start','-W','-f','0x10008000','-n','demo.remotecompose/.MainActivity','--es','backend','http://127.0.0.1:8092','--es','version','latest'])
identity=installed();stamp=time.strftime('%Y%m%d-%H%M%S');result=f'artifacts/interactive/ios-live-{stamp}.xcresult';log=folder/'live-ios.log'
with log.open('w') as output:
 process=subprocess.Popen(['xcodebuild','test','-project','ios-player/UITests.xcodeproj','-scheme','DemoUITests','-only-testing:DemoUITests/DemoUITests/testLiveJsonRefresh','-destination',f'platform=iOS Simulator,id={device}','-derivedDataPath','ios-player/build/uitests','-resultBundlePath',result,'CODE_SIGNING_ALLOWED=NO'],env=env,stdout=output,stderr=subprocess.STDOUT)
 try:
  for _ in range(70):
   if 'JSON_LIVE_READY' in log.read_text():break
   if process.poll() is not None:raise RuntimeError('iOS test exited before live publication; inspect live-ios.log')
   time.sleep(1)
  else:raise RuntimeError('No iOS readiness marker')
  print('Both native apps are running. Editing and publishing through browser UI.',flush=True)
  run(['sh','scripts/node.sh','node','player-smoke/live-json-publish.mjs'])
  publication=json.load(open(folder/'live-publication.json'));expected=publication['after']['sha256']
  # Native toolbar hit target comes from the actual accessibility tree.
  run([adb,'shell','uiautomator','dump','/sdcard/Download/rc-live-ui.xml'])
  import xml.etree.ElementTree as ET
  tree=ET.fromstring(run([adb,'exec-out','cat','/sdcard/Download/rc-live-ui.xml']))
  refresh=next(n for n in tree.iter('node') if n.attrib.get('content-desc')=='Refresh')
  x1,y1,x2,y2=map(int,re.findall(r'\d+',refresh.attrib['bounds']));run([adb,'shell','input','tap',str((x1+x2)//2),str((y1+y2)//2)])
  for _ in range(30):
   lines=run([adb,'logcat','-d','-s','RC_DOCUMENT:I'],text=True).splitlines()
   documents=[line for line in lines if 'sha256=' in line]
   if documents and expected in documents[-1]:break
   time.sleep(1)
  else:raise RuntimeError('Android did not fetch exact live-published digest')
  prior=[s for s in run([adb,'logcat','-d','-s','RC_HOST_EVENT:I'],text=True).splitlines() if 'RC_HOST_EVENT:' in s]
  viewport=[s for s in run([adb,'logcat','-d','-s','RC_VIEWPORT:I'],text=True).splitlines() if 'headerFit=false' in s][-1]
  vx,vy,density=map(float,re.search(r'x=(\d+) y=(\d+).*density=([0-9.]+)',viewport).groups())
  run([adb,'shell','input','tap',str(round(vx+100*density)),str(round(vy+128*density))]);time.sleep(.4)
  following=[s for s in run([adb,'logcat','-d','-s','RC_HOST_EVENT:I'],text=True).splitlines() if 'RC_HOST_EVENT:' in s][len(prior):]
  if len(following)!=1 or 'name=promotion.open' not in following[0]:raise RuntimeError('Live Android banner action missing/duplicated')
  (folder/'live-android.png').write_bytes(run([adb,'exec-out','screencap','-p']))
  process.wait(timeout=80)
  if process.returncode or 'JSON_LIVE_PASS' not in log.read_text():raise RuntimeError('iOS live-refresh test failed')
  after=installed()
  if identity!=after:raise RuntimeError('Native application binary changed during document publication')
  proof={'before':publication['before'],'after':publication['after'],'draftIsolated':publication['draftIsolated'],'browserPreviewMatchesPublished':True,'androidLatestDecodedHash':expected,'iosDigestAssertedByXCTest':expected,'installedClientHashesBefore':identity,'installedClientHashesAfter':after,'clientBinariesUnchanged':True,'iosResult':result,'manualAndroidRefreshTarget':refresh.attrib['bounds'],'androidHostEvent':following[0].split('RC_HOST_EVENT:')[-1].strip()}
  (folder/'live-proof.json').write_text(json.dumps(proof,indent=2)+'\n');print('Live JSON publication, native refresh and unchanged installed binary hashes passed.',flush=True)
 finally:
  if process.poll() is None:process.terminate()
