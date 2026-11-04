# GitHub setup

2026-11-03: gh2.103.3 authenticated to GitHub as aoriani. The initially clean main
repository had no remotes. `gh repo view aoriani/remote-compose` confirmed the name
was unused. Created a private repository with the existing history as local source:

```sh
gh repo create aoriani/remote-compose --private --source=. --remote=origin
```

Repository: https://github.com/aoriani/remote-compose

Origin fetch/push: `git@github.com:aoriani/remote-compose.git`. Privacy confirmed using
`gh repo view --json url,isPrivate`. **No push performed at that milestone.** The repository remained empty pending
explicit authorization. Local history was preserved.

.gitignore covers dependencies, fetched upstreams, builds, artifacts, runtime data,
SDK configuration, environment files, signing keys/profiles and Xcode user data.
Added PEM/KEY/P8/user-state exclusions. Filename audit found no tracked credential or
signing files. This is not a full historical secret audit: repeat content/history
scanning and review before any authorized push. Do not print tokens in reports.

2026-11-04 follow-up: a tracked-content pattern audit for private keys, GitHub tokens and
AWS access key IDs passed without printing values. GitHub API still reports private=true,
size=0/default_branch=main. This limited scan does not certify full historical secrets.


## Authorized publication (2026-11-04)

The user explicitly authorized pushing the existing project to this private repository.
This supersedes earlier session-specific "no push" notes; future pushes still require
user authorization. `gh auth status` confirms the aoriani account and repository access.
The GitHub API confirms PRIVATE visibility. Remote inspection before this first push found
no branches, so the complete existing local main history is included, not a replacement
repository or rewritten history.

The configured origin remains `git@github.com:aoriani/remote-compose.git`. In this execution
environment, `git ls-remote --heads origin` fails with **Host key verification failed**.
Authenticated HTTPS works. Use a command-scoped transport rewrite and the authenticated
GitHub CLI credential helper; no SSH verification is disabled, credentials are not embedded
in URLs, and the stored origin/global Git configuration is not changed:

```sh
git -c 'url.https://github.com/.insteadOf=git@github.com:' \
  -c credential.helper= -c 'credential.helper=!gh auth git-credential' \
  push -u origin main
```

Verify with the same configuration and `ls-remote --heads origin main`, comparing the
returned SHA to `git rev-parse HEAD`. Use normal fast-forward pushes only; never force-push.

Pre-push review: .gitignore excludes generated output, dependencies, local configuration,
runtime publication stores, simulator data and signing material. All historical blobs
reachable through the Android sheet implementation were scanned for known private-key/token
patterns, embedded URL credentials and sensitive filenames. No real secrets or GitHub-size
violations were found. One URL in DebugSettingsTest is an explicit synthetic example.org
fixture that tests rejecting credentials; it was reviewed and excluded as a false positive.
This targeted scan is not comprehensive secret certification. The final documentation commit
is scanned again before pushing. README guide coverage and local documentation/image links
are checked by `python3 scripts/check-project.py`.
