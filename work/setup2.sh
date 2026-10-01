d=$1; n=$2; cd /home/user/boxel-tas-v2/work/$d/sim; P=../../L5/sim
for f in sv.js loop.sh wp.sh pm.js; do sed "s/loadLevel(5)/loadLevel($n)/;s/L5\.json/L$n.json/;s/level:5/level:$n/;s/{5:/{$n:/;s/ 5 \\\$T0/ $n \$T0/;s/multibeam.js 5/multibeam.js $n/" $P/$f > $f; done
sed -i 's/t>=1/t>=0/' suffix.js
cp ../../L19/sim/refprog.js ../../L19/sim/rpl.sh .; sed -i "s/n=19/n=$n/;s/L19/L$n/" refprog.js rpl.sh
node -e "const j=require('../../../results/L$n.json');require('fs').writeFileSync('best.json',JSON.stringify({$n:j.jumps}))"
