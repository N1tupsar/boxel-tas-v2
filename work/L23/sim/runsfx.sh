for T0 in 0 60 100 130 180 250 330; do node suffix.js 23 $T0 500 $1; done > sfx_$1.log 2>&1
