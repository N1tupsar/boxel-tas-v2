n=$1; cd /home/user/boxel-tas-v2/work/L$n/sim; P=../../L5/sim
for f in sv.js loop.sh wp.sh pm.js; do sed "s/loadLevel(5)/loadLevel($n)/;s/L5\.json/L$n.json/;s/level:5/level:$n/;s/{5:/{$n:/;s/ 5 \\\$T0/ $n \$T0/;s/multibeam.js 5/multibeam.js $n/" $P/$f > $f; done
sed -i 's/t>=1/t>=0/' suffix.js
