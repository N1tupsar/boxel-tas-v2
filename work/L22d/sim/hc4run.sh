cd /home/user/boxel-tas-v2/work/L22d/sim
for f in "$@"; do node hc4.js 7 1500 ./$f >> hc4.log 2>&1; done
