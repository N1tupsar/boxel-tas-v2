#!/bin/sh
for P in "$@"; do PRE="$P" timeout 170 node --max-old-space-size=2500 suf2.js 3 70 800 1000 2>&1 | cut -c1-120 | sed "s#^#$P #"; done
