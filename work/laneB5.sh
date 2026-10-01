# laneB3.sh dir n ms seeds...
d=$1; n=$2; ms=$3; shift 3
cd /home/user/boxel-tas-v2/work/$d/sim
for s in "$@"; do
 node ge_save.js $n $s $ms > ge$s.log 2>&1
 J=$(grep -h FOUND ge$s.log | sed 's/.*verified [0-9]* //')
 [ -z "$J" ] && { echo "ge$s none" >> B.log; continue; }
 echo "{\"level\":$n,\"jumps\":$J}" > ref_ge$s.json
 echo "ge$s $(grep -h FOUND ge$s.log | cut -c1-30)" >> B.log
 for P in "800 0 25 12" "800 0 15 20" "800 0 35 10"; do
  out=$(REF=./ref_ge$s.json node --max-old-space-size=3000 refprog.js $P 2>/dev/null)
  j=$(echo "$out" | node -e "try{console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8')).jumps))}catch(e){}")
  echo "ge$s refprog $P -> $(node sv.js "$j" 2>&1 | tr '\n' ' ')" >> B.log
 done
done
