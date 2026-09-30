for T0 in "$@"; do for TM in 4 1000; do timeout 600 node --max-old-space-size=5000 suffix.js 28 $T0 ${W:-1000} $TM; done; done
