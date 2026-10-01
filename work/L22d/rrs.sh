# rrs.sh seedlist...: refprog sweeps for several refs
cd /home/user/boxel-tas-v2/work/L22d/sim
for s in "$@"; do for P in "800 0 20 12" "800 0 35 10" "1000 0 25 18" "800 0 28 8" "800 10 25 12"; do
 out=$(REF=./ref_ge$s.json node --max-old-space-size=3000 refprog.js $P 2>/dev/null)
 j=$(echo "$out" | node -e "try{console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8')).jumps))}catch(e){}")
 echo "ref$s $P -> $(node sv.js "$j" 2>&1 | tr '\n' ' ')" >> R.log
done; done
