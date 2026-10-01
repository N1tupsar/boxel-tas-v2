# runwp.sh tag level W TM 'WPS'
cd /home/user/boxel-tas-v2/work/tunnel/sim
echo "$1 L$2 W$3 TM$4 WPS=$5 :: $(WPS="$5" ALPHAS=0.5 LAMBDA=0 timeout ${TO:-400} node multibeam.js $2 $3 $4 2>&1 | tail -1 | cut -c1-300)" >> ../wp_results.log
