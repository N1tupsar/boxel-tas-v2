# wp.sh name WPS W
for TM in 4 1000; do echo "$1 $TM $(WPS="$2" ALPHAS=0.5 LAMBDA=0 timeout 600 node multibeam.js 18 $3 $TM 2>&1 | tail -1 | cut -c1-900)" >> wp_$1.log; done
