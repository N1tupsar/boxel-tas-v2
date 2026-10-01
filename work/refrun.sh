# refrun.sh dir n 'jumps'
cd /home/user/boxel-tas-v2/work/$1/sim; n=$2; echo "{\"level\":$n,\"jumps\":$3}" > ref_base.json
for P in "800 0 30 12" "800 0 20 20" "800 0 15 25" "800 30 25 10"; do
 out=$(REF=./ref_base.json node --max-old-space-size=4000 refprog.js $P 2>/dev/null)
 j=$(echo "$out" | node -e "try{console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8')).jumps))}catch(e){}")
 echo "base-ref $P -> $(node sv.js "$j" 2>&1 | tr '\n' ' ')" >> C.log
done
