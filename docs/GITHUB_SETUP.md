# GitHub setup

2026-11-03: gh2.103.3 authenticated to GitHub as aoriani. The initially clean main
repository had no remotes. `gh repo view aoriani/remote-compose` confirmed the name
was unused. Created a private repository with the existing history as local source:

```sh
gh repo create aoriani/remote-compose --private --source=. --remote=origin
```

Repository: https://github.com/aoriani/remote-compose

Origin fetch/push: `git@github.com:aoriani/remote-compose.git`. Privacy confirmed using
`gh repo view --json url,isPrivate`. **No push performed.** GitHub has no project
commits until the user explicitly authorizes a push. Local history was preserved.

.gitignore covers dependencies, fetched upstreams, builds, artifacts, runtime data,
SDK configuration, environment files, signing keys/profiles and Xcode user data.
Added PEM/KEY/P8/user-state exclusions. Filename audit found no tracked credential or
signing files. This is not a full historical secret audit: repeat content/history
scanning and review before any authorized push. Do not print tokens in reports.
