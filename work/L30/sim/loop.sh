# usage: loop.sh name W T0list...
name=$1; W=$2; shift 2
for T0 in "$@"; do for TM in 4 1000; do
 r=$(timeout 900 node --max-old-space-size=5000 suffix.js 30 $T0 $W $TM)
 echo "$r" >> $name.log
 j=$(echo "$r" | node -e "const l=require('fs').readFileSync(0,'utf8');try{console.log(JSON.stringify(JSON.parse(l).jumps))}catch(e){}")
 [ -n "$j" ] && flock /tmp/l30.lock node sv.js "$j" >> $name.sv
done; done
