# rpl.sh W T0 R LOOK
out=$(node --max-old-space-size=4000 refprog.js $1 $2 $3 $4 2>/dev/null)
j=$(echo "$out" | node -e "try{console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8')).jumps))}catch(e){}")
echo "$@ -> $(node sv.js "$j" 2>&1 | tr '\n' ' ')"
