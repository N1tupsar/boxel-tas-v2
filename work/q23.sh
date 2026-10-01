cd /home/user/boxel-tas-v2/work/L23e/sim
for TM in 1000 4; do
echo "exit-left TM$TM :: $(WPS='[[-96,208,18],[-220,178,25],[-304,240,20]]' ALPHAS=0.5 LAMBDA=0 timeout 500 node multibeam.js 23 700 $TM 2>&1 | tail -1 | cut -c1-300)" >> reg.log
done
