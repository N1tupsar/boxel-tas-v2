#!/bin/sh
for P in "$@"; do PRE="$P" K=25 timeout 150 node --max-old-space-size=2500 left2.js 6 120 1500 1000 2>&1 | cut -c1-110 | sed "s#^#$P #"; done
