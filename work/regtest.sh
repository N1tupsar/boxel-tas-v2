# regtest.sh dir n tag 'WPS'
cd /home/user/boxel-tas-v2/work/$1/sim
for TM in 1000 4; do
echo "$3 TM$TM WPS=$4 :: $(WPS="$4" ALPHAS=0.5 LAMBDA=0 timeout ${TO:-150} node multibeam.js $2 ${W:-500} $TM 2>&1 | tail -1 | cut -c1-260)" >> reg.log
done
