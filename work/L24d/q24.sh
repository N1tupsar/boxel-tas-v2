cd /home/user/boxel-tas-v2/work/L24d/sim
for TM in 4 1000; do
echo "hook TM$TM :: $(WPS='[[79,-434,40],[624,-328,25]]' ALPHAS=0.5 LAMBDA=0 timeout 400 node multibeam.js 24 800 $TM 2>&1 | tail -1 | cut -c1-300)" >> hook.log
done
