cd /home/user/boxel-tas-v2/work/L22d/sim
for i in $(seq $1 $2); do r=$(node --max-old-space-size=3000 suffixc.js 22 $(node -e "const a=require('./cand$i.json')[22];console.log(Math.max(...a)+1)") 600 4 ./cand$i.json); echo "cand$i $(echo $r | cut -c1-140)" >> cand.log; done
