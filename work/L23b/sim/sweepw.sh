for T0 in "$@"; do for TM in 4 1000; do echo "$(timeout 600 node --max-old-space-size=5000 suffix.js 23 $T0 1500 $TM)"; done; done
